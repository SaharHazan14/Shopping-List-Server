import { z } from "zod"
import { Role } from "../../../../generated/prisma/enums"

export const UpdateListMemberSchema = z.object({
    listId: z.coerce
            .number({error: "list ID must be a positive integer"})
            .int({error: "list ID must be a positive integer"})
            .positive({error: "list ID must be a positive integer"}),
    memberId: z.coerce
            .number({error: "list ID must be a positive integer"})
            .int({error: "list ID must be a positive integer"})
            .positive({error: "list ID must be a positive integer"}),
    role: z        
            .string()   
            .transform((val) => val.toUpperCase())
            .refine((val) => (Object.values(Role) as string[]).filter((val) => val != Role.OWNER).includes(val),
                    {message: `invalid role, expect one of the values: ${Object.values(Role).filter((val) => val != Role.OWNER)}`})
            .transform((val) => val as Role)
})