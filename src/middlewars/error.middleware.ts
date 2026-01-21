import { Response, Request, NextFunction } from "express";
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from "../errors/index.js"

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof BadRequestError) {
    return res.status(400).json({ message: err.message})
  }
  
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ message: err.message })
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message })
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({ message: err.message})
  }

  return res.status(500).json({ message: "Internal server error" })
}