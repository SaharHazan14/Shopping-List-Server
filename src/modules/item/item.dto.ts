import { Category } from "../../generated/prisma/enums";

export interface CreateItemDTO {
    name: string,
    category: Category,
    imageUrl?: string,
    userId: number
}

export interface UpdateItemDTO {
    itemId: number,
    name?: string,
    category?: Category,
    imageUrl?: string
}

export interface ItemResponseDTO {
    id: number,
    name: string, 
    category: Category,
    imageUrl: string | null,
    creatorId: number | null
}