import { z } from "zod"
import { Role } from "../../../generated/prisma/enums"

const idSchema = z.coerce.number().int().positive()

const positiveIntSchema = z.coerce.number().int().positive()

const nonEmptyString = z.string().trim().min(2)

const roleSchema = z.enum(Object.values(Role) as [Role, ...Role[]]).exclude([Role.OWNER])

export const CreateListBodySchema = z.object({
    title: nonEmptyString,
    description: nonEmptyString.optional()
})

export const ListIdParamSchema = z.object({
    listId: idSchema
})

export const GetUserListsQuerySchema = z.object({
    includeMember: z.coerce.boolean().optional().default(false)
})

export const UpdateListBodySchema = z.object({
    title: nonEmptyString.optional(),
    description: nonEmptyString.optional()
})
.strict().superRefine((data, ctx) => {
    if (data.title === undefined && data.description === undefined) {
        ctx.addIssue({
        code: "custom",
        message: "at least one field must be provided for update"
        })
    }
})

export const AddListMemberBodySchema = z.object({
    memberId: idSchema,
    role: roleSchema
})

export const ListIdMemberIdParamsSchema = z.object({
    listId: idSchema,
    memberId: idSchema
})

export const UpdateListMemberBodySchema = z.object({
    role: roleSchema
})

export const AddListItemBodySchema = z.object({
    itemId: idSchema,
    quantity: positiveIntSchema,
    isChecked: z.boolean()
})

export const ListIdItemIdParamsSchema = z.object({
    listId: idSchema,
    itemId: idSchema
})

export const UpdateListItemBodySchema = z.object({
    quantity: idSchema.optional(),
    isChecked: z.boolean().optional()
})
.strict().superRefine((data, ctx) => {
    if (data.quantity === undefined && data.isChecked === undefined) {
        ctx.addIssue({
        code: "custom",
        message: "at least one field must be provided for update"
        })
    }
})