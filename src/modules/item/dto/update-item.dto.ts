import { Category } from "../../../../generated/prisma/enums";

export interface UpdateItemDTO {
    itemId: number,
    name?: string,
    category?: Category,
    imageUrl?: string
}