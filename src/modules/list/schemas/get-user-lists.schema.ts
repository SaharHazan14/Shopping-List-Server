import { boolean, z } from "zod"

export const GetUserListsSchema = z.object({
  includeMember: z
    .union(
      [z.literal("true"), z.literal("false")],
      { error: "includeMember must be 'true' or 'false'" }
    )
    .optional()
    .transform((val) => val === "true")
})