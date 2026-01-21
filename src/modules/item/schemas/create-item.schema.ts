import { z } from "zod"
import { Category } from "../../../../generated/prisma/enums"

export const CreateItemSchema = z.object({
    name: z
        .string({
            error: (issue) => 
                issue.input === undefined
                    ? "name is required"
                    : "name must be a string"
        })
        .trim()
        .min(2, {error: "name must be at least 2 characters long"})
        .transform((val) => val.trim()),
    category: z
        .string()
        .transform((val) => val.toUpperCase())
        .refine((val) => (Object.values(Category) as string[]).includes(val),
                {message: `invalid category, expect one of the values: ${Object.values(Category)}`})
        .transform((val) => val as Category),
    imageUrl: z
        .string()
        .optional()
        .transform((val) => typeof val === "string" ? val : null)
})