import { Request, Response, NextFunction } from "express";
import * as paymentsService from "./payments.service";
import { sendSuccess, sendError } from "../../utils/response";
import { AppError } from "../../utils/errors";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.user!.id;
    const { rentalRequestId } = req.body;
    const result = await paymentsService.createCheckoutSession(tenantId, rentalRequestId);
    sendSuccess(res, 201, "Stripe checkout session created successfully", result);
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return sendError(res, 400, "Missing Stripe signature header", null);
  }

  try {
    // req.body is verified to be a Buffer since express.raw is applied to this route
    await paymentsService.confirmPayment(sig as string, req.body as Buffer);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const filters = req.query as any;

    if (role === "TENANT") {
      const result = await paymentsService.getTenantPayments(userId, filters);
      return sendSuccess(res, 200, "Tenant payment history retrieved successfully", result);
    }

    if (role === "LANDLORD") {
      const result = await paymentsService.getLandlordPayments(userId, filters);
      return sendSuccess(res, 200, "Landlord property payment history retrieved successfully", result);
    }

    if (role === "ADMIN") {
      throw new AppError(
        403,
        "Forbidden: Admins must query payment logs through the dedicated admin endpoints"
      );
    }

    throw new AppError(403, "Forbidden: Access denied");
  } catch (error) {
    next(error);
  }
};

export const getDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await paymentsService.getPaymentById(id as string, userId);
    sendSuccess(res, 200, "Payment details retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
