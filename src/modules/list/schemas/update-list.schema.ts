import { z } from "zod"

export const UpdateListSchema = z.object({
    listId: z.coerce
        .number({error: "list ID must be a positive integer"})
        .int({error: "list ID must be a positive integer"})
        .positive({error: "list ID must be a positive integer"}),
    title: z
        .string({ error: "title must be a string" })
        .trim()
        .min(2, { error: "title must be at least 2 characters long" })
        .optional(),
    description: z
        .union(
          [z.string(), z.null()], 
          {error: "description must be a string or null"}
        )
        .transform(val => typeof val === "string" ? val.trim() : val)
        .optional()
})
.strict()
.superRefine((data, ctx) => {
    if (data.title === undefined && data.description === undefined) {
        ctx.addIssue({
        code: "custom",
        message: "at least one field must be provided for update",
        })
    }
})
