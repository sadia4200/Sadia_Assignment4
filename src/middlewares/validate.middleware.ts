import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { AppError } from "../utils/errors";

export const validate = (schema: z.ZodObject<any> | z.ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const shape = (schema as any).shape;
      const isStructured = shape && (shape.body || shape.query || shape.params);

      if (isStructured) {
        const parsed: any = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;
      } else {
        req.body = await schema.parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.issues.map((issue) => {
          const path = issue.path.join(".");
          const field = path.replace(/^(body|query|params)\./, "");
          return {
            field: field || path,
            message: issue.message,
          };
        });
        return next(new AppError(400, "Validation Error", errorDetails));
      }
      next(error);
    }
  };
};
