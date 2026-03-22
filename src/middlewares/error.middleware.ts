import { Response, Request, NextFunction } from "express";
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError, UnauthorizedError } from "../errors/index.js"
import logger from "../logger.js"

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
  });

  if (err instanceof BadRequestError) {
    return res.status(400).json({ message: err.message})
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ message: err.message })
  }
  
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ message: err.message })
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message })
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({ message: err.message })
  }

  return res.status(500).json({ message: err.message || "Internal server error" })
}