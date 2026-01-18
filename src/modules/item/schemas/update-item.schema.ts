import { z } from "zod"
import { Category } from "../../../../generated/prisma/enums"

export const UpdateItemSchema = z.object({
    itemId: z.coerce
        .number({error: "item ID must be a positive integer"})
        .int({error: "item ID must be a positive integer"})
        .positive({error: "item ID must be a positive integer"}),
    name: z
        .string({ error: "name must be a string" })
        .trim()
        .min(2, { error: "name must be at least 2 characters long" })
        .optional(),
    category: z
        .string()
        .transform((val) => val.toUpperCase())
        .refine((val) => (Object.values(Category) as string[]).includes(val),
                {message: `invalid category, expect one of the values: ${Object.values(Category)}`})
        .transform((val) => val as Category)
        .optional(),
    imageUrl: z
        .string()
        .optional()
})
.strict()
.superRefine((data, ctx) => {
    if (data.name === undefined && data.category === undefined && data.imageUrl === undefined) {
        ctx.addIssue({
        code: "custom",
        message: "at least one field must be provided for update",
        })
    }
})
