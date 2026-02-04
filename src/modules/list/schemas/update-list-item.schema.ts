import { z } from "zod"
import { positiveInt } from "../../../utils/zod-helpers"

export const UpdateListItemSchema = z.object({
    listId: positiveInt("list ID"),
    itemId: positiveInt("item ID"),
    quantity: positiveInt("quantity").optional(),
    isChecked: z.boolean().optional()
})
.strict()
.superRefine((data, ctx) => {
    if (data.quantity === undefined && data.isChecked === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "at least one field must be provided for update",
        })
    }
})