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
  tenantId: string,
  rentalRequestId: string
): Promise<{ sessionId: string; url: string | null }> => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: {
      property: true,
    },
  });

  if (!rentalRequest) {
    throw new AppError(404, "Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(403, "Forbidden: Access denied");
  }

  const existingCompletedPayment = await prisma.payment.findFirst({
    where: {
      rentalRequestId,
      status: "COMPLETED",
    },
  });

  if (existingCompletedPayment || rentalRequest.status === "ACTIVE" || rentalRequest.status === "COMPLETED") {
    throw new AppError(409, "Payment has already been completed for this rental request");
  }

  if (rentalRequest.status !== "APPROVED") {
    throw new AppError(
      400,
      `Payment can only be made for approved rental requests. Current request status is ${rentalRequest.status}.`
    );
  }

  const property = rentalRequest.property;
  const amountInCents = Math.round(property.price * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Rental Payment: ${property.title}`,
            description: `Rental booking for property located in ${property.location}`,
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
      rentalRequestId,
      tenantId,
    },
  });

  // Check if a pending payment with this session/transaction already exists or create new
  await prisma.payment.create({
    data: {
      rentalRequestId,
      transactionId: session.id,
      amount: property.price,
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
    const rentalRequestId = session.metadata?.rentalRequestId;

    if (!rentalRequestId) {
      console.warn("Stripe webhook session completed without rentalRequestId in metadata.");
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
        prisma.rentalRequest.update({
          where: { id: rentalRequestId },
          data: {
            status: "ACTIVE",
          },
        }),
      ]);
    }
  }
};

export const getTenantPayments = async (tenantId: string, filters: PaymentsQueryFilters) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    rentalRequest: {
      tenantId,
    },
  };
  if (status) {
    whereClause.status = status;
  }

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        rentalRequest: {
          include: {
            property: true,
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

export const getLandlordPayments = async (landlordId: string, filters: PaymentsQueryFilters) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    rentalRequest: {
      property: {
        landlordId,
      },
    },
  };
  if (status) {
    whereClause.status = status;
  }

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        rentalRequest: {
          include: {
            property: true,
            tenant: {
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
      rentalRequest: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  const rental = payment.rentalRequest;

  // Access check: only tenant who paid or property landlord
  if (rental.tenantId !== userId && rental.property.landlordId !== userId) {
    throw new AppError(403, "Forbidden: Access denied");
  }

  return payment;
};
