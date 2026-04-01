import { z } from "zod"
import { Category } from "../../generated/prisma/enums"

const idSchema = z.coerce.number().int().positive()

const nonEmptyString = z.string().trim().min(2)

const categorySchema = z.enum(Object.values(Category) as [Category, ...Category[]])

export const CreateItemBodySchema = z.object({
    name: nonEmptyString,
    category: categorySchema,
    imageUrl: z.url().optional()
})

export const ItemIdParamSchema = z.object({
    itemId: idSchema
})

export const GetUserItemsQuerySchema = z.object({
    global: z.coerce.boolean().optional().default(true)
})

export const UpdateItemBodySchema = z.object({
    name: nonEmptyString.optional(),
    category: categorySchema.optional(),
    imageUrl: z.url().optional()
})
.strict().superRefine((data, ctx) => {
    if (data.name === undefined && data.category === undefined && data.imageUrl === undefined) {
        ctx.addIssue({
        code: "custom",
        message: "at least one field must be provided for update"
        })
    }
})