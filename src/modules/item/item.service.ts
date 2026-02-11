import { Item } from "../../../generated/prisma/client";
import { ConflictError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateItemDTO, UpdateItemDTO, ItemResponseDTO } from "./item.dto";
import { ItemRepository } from "./item.repository";

export class ItemService{
    constructor(private readonly repository: ItemRepository) {}

    private toItemResponseDTO(item: Item): ItemResponseDTO {
        return {
            id: item.id,
            name: item.name,
            category: item.category,
            imageUrl: item.image,
            creatorId: item.creator_id
        }
    }

    async createItem(dto: CreateItemDTO): Promise<ItemResponseDTO> { 
        const exist = await this.repository.existByNameAndCreator(dto.name, dto.userId)

        if (exist) {
            throw new ConflictError("you already have an item with this name")
        }

        const item = await this.repository.create(dto)
        
        return this.toItemResponseDTO(item)
    }

    async getItemById(itemId: number, userId: number): Promise<ItemResponseDTO> {
        const item = await this.repository.findById(itemId)
        if (!item) {
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== null && item.creator_id !== userId) {
            throw new ForbiddenError("access denied")
        }

        return this.toItemResponseDTO(item)
    }

    async getUserItems(userId: number, global: boolean): Promise<ItemResponseDTO[]> {
        let items = await this.repository.findByCreator(userId)
        if (global) {
            items = items.concat(await this.repository.findGlobals())
        }

        return items.map(item => this.toItemResponseDTO(item))
    }

    async updateItem(userId: number, dto: UpdateItemDTO): Promise<ItemResponseDTO> {
        const item = await this.repository.findById(dto.itemId)
        if (!item) {
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== userId) {
            throw new ForbiddenError("access denied, you are not allowed to update this item")
        }

        if (dto.name && dto.name !== item.name) {
            const exist = await this.repository.existByNameAndCreator(dto.name, userId)
            if (exist) {
                throw new ConflictError("you already have an item with this name")
            }
        }

        const updated = await this.repository.update(dto)
        
        return this.toItemResponseDTO(updated)
    }

    async deleteItem(userId: number, itemId: number) {
        const item = await this.repository.findById(itemId)
        if (!item) {
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== userId) {
            throw new ForbiddenError("access denied, you are not allowed to delete this item")
        }

        await this.repository.delete(itemId)
    }
}