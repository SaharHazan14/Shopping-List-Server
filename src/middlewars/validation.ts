import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { BadRequestError } from "../errors";

type ValidationSchemas = {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
};

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
        }
        req.body = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
        }
        req.params = result.data as any;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
        }
        req.query = result.data as any;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestError(
          err.issues.map(i => i.message).join(", ")
        );
      }
      next(err);
    }
  };
}
