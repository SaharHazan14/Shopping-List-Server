import { z } from "zod"

export const DeleteListSchema = z.object({
    id: z.coerce
        .number({error: "list ID must be a positive integer"})
        .int({error: "list ID must be a positive integer"})
        .positive({error: "list ID must be a positive integer"})
})