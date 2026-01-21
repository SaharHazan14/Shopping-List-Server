import { Category } from "../../../../generated/prisma/enums";

export interface ItemResponseDTO {
    id: number,
    name: string, 
    category: Category,
    imageUrl: string | null,
    creatorId: number | null
}