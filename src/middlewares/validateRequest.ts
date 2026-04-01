import { Request, Response, NextFunction } from 'express'
import { ZodType } from 'zod'
import { BadRequestError } from '../errors/index.js'
import logger from '../logger.js'

type Schemas = {
  params?: ZodType<unknown>
  body?: ZodType<unknown>
  query?: ZodType<unknown>
}

export function validateRequest(schemas: Schemas) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (schemas.params) {
            const result = schemas.params.safeParse(req.params)
            if (!result.success) {
                logger.warn('Request validation failed - params', { errors: result.error.issues })
                throw new BadRequestError(formatZodError(result.error))
            }
            req.params = result.data as any
        }

        if (schemas.query) {
            const result = schemas.query.safeParse(req.query)
            if (!result.success) {
                logger.warn('Request validation failed - query', { errors: result.error.issues })
                throw new BadRequestError(formatZodError(result.error))
            }
            //req.query = result.data as any
        }

        if (schemas.body) {
            const result = schemas.body.safeParse(req.body)
            if (!result.success) {
                logger.warn('Request validation failed - body', { errors: result.error.issues })
                throw new BadRequestError(formatZodError(result.error))
            }
            req.body = result.data as any
        }

        next()
    }
}

function formatZodError(error: any) {
  return error.issues
    .map((i: any) => `${i.path.join('.') || 'body'}: ${i.message}`)
    .join(', ')
}