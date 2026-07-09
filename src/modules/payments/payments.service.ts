import prisma from "../../config/prisma";
import { AppError } from "../../utils/errors";
import config from "../../config";
import Stripe from "stripe";
import { Payment, PaymentStatus } from "@prisma/client";

const stripe = new Stripe(config.stripe?.secretKey || "");

export interface PaymentsQueryFilters {
  status?: PaymentStatus;
  page: number;
  limit: number;
}

export const createCheckoutSession = async (
  customerId: string,
  bookingId: string
): Promise<{ sessionId: string; url: string | null }> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.customerId !== customerId) {
    throw new AppError(403, "Forbidden: Access denied");
  }

  const existingCompletedPayment = await prisma.payment.findFirst({
    where: {
      bookingId,
      status: "COMPLETED",
    },
  });

  const nonPayableStatuses = ["PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DECLINED"];
  if (existingCompletedPayment || nonPayableStatuses.includes(booking.status)) {
    throw new AppError(409, "Payment has already been completed or booking is inactive");
  }

  if (booking.status !== "ACCEPTED") {
    throw new AppError(
      400,
      `Payment can only be made for accepted bookings. Current booking status is ${booking.status}.`
    );
  }

  const service = booking.service;
  const amountInCents = Math.round(service.price * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Service Payment: ${service.title}`,
            description: `Home service booking located in ${service.location}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.app_base_url}/api/payments/success`,
    cancel_url: `${config.app_base_url}/api/payments/cancel`,
    metadata: {
      bookingId,
      customerId,
    },
  });

  // Create pending payment record
  await prisma.payment.create({
    data: {
      bookingId,
      transactionId: session.id,
      amount: service.price,
      method: "CARD",
      provider: "STRIPE",
      status: "PENDING",
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
};

export const confirmPayment = async (signature: string, rawBody: Buffer): Promise<void> => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    throw new AppError(400, `Stripe webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.warn("Stripe webhook session completed without bookingId in metadata.");
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { transactionId: session.id },
    });

    if (payment && payment.status !== "COMPLETED") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { transactionId: session.id },
          data: {
            status: "COMPLETED",
            paidAt: new Date(),
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "PAID",
          },
        }),
      ]);
    }
  }
};

export const getCustomerPayments = async (customerId: string, filters: PaymentsQueryFilters) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    booking: {
      customerId,
    },
  };
  if (status) {
    whereClause.status = status;
  }

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.payment.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    payments,
  };
};

export const getTechnicianPayments = async (technicianId: string, filters: PaymentsQueryFilters) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    booking: {
      technicianId,
    },
  };
  if (status) {
    whereClause.status = status;
  }

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            service: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.payment.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    payments,
  };
};

export const getPaymentById = async (paymentId: string, userId: string): Promise<any> => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  const booking = payment.booking;

  // Access check
  if (booking.customerId !== userId && booking.technicianId !== userId) {
    throw new AppError(403, "Forbidden: Access denied");
  }

  return payment;
};
