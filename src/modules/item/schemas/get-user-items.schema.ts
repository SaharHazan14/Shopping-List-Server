import { z } from "zod"

export const GetUserItemsSchema = z.object({
  global: z
    .union(
      [z.literal("true"), z.literal("false")],
      { error: "global must be 'true' or 'false'" }
    )
    .optional()
    .transform((val) => val === "true")
})