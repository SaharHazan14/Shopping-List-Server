import { z } from "zod"

export const positiveInt = (fieldName: string) =>
  z.coerce.number().refine(
    (val) => Number.isInteger(val) && val > 0,
    { message: `${fieldName} must be a positive integer` }
  )
