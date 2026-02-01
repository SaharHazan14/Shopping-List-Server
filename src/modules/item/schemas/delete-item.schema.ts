import { z } from "zod"

export const DeleteItemSchema = z.object({
    id: z.coerce
        .number({error: "item ID must be a positive integer"})
        .int({error: "item ID must be a positive integer"})
        .positive({error: "item ID must be a positive integer"})
})