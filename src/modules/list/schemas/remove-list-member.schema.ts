import { z } from "zod"

export const RemoveListMemberSchema = z.object({
    listId: z.coerce
            .number({error: "list ID must be a positive integer"})
            .int({error: "list ID must be a positive integer"})
            .positive({error: "list ID must be a positive integer"}),
    memberId: z.coerce
            .number({error: "list ID must be a positive integer"})
            .int({error: "list ID must be a positive integer"})
            .positive({error: "list ID must be a positive integer"})
})