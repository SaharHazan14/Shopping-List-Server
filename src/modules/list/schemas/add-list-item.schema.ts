import { z } from "zod"

export const AddListItemSchema = z.object({
    listId: z.coerce
        .number({error: "list ID must be a positive integer"})
        .int({error: "list ID must be a positive integer"})
        .positive({error: "list ID must be a positive integer"}),
    itemId: z.coerce
        .number({error: "item ID must be a positive integer"})
        .int({error: "item ID must be a positive integer"})
        .positive({error: "item ID must be a positive integer"}),
    quantity: z.coerce
        .number({error: "quantity must be a positive integer"})
        .int({error: "quantity must be a positive integer"})
        .positive({error: "quantity must be a positive integer"}),
    isChecked: z
        .union(
            [z.literal("true"), z.literal("false")],
            { error: "isChecked must be 'true' or 'false'" }
        )
        .optional()
        .transform((val) => val === "true")
})