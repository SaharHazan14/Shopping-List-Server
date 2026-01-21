import { Category } from "../../../../generated/prisma/enums";

export interface CreateItemDTO {
    name: string,
    category: Category,
    imageUrl: string | null,
    userId: number
}