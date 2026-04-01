import { Item } from "../..//generated/prisma/client";
import { ConflictError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateItemDTO, UpdateItemDTO, ItemResponseDTO } from "./item.dto";
import { ItemRepository } from "./item.repository";
import logger from "../../logger";

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
            logger.warn("Attempted to create duplicate item", { 
                name: dto.name, 
                userId: dto.userId 
            })
            throw new ConflictError("you already have an item with this name")
        }

        const item = await this.repository.create(dto)
        logger.info("Item created successfully", { 
            itemId: item.id,
            itemName: item.name,
            creatorId: item.creator_id
        })

        return this.toItemResponseDTO(item)
    }

    async getItemById(itemId: number, userId: number): Promise<ItemResponseDTO> {
        const item = await this.repository.findById(itemId)
        if (!item) {
            logger.warn("Attempted to fetch non-existent item", { 
                itemId 
            })
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== null && item.creator_id !== userId) {
            logger.warn("Attempted to access item without permission", { 
                itemId, 
                userId 
            })
            throw new ForbiddenError("access denied")
        }

        logger.info("Fetched item successfully", { 
            itemId: item.id, 
            itemName: item.name, 
            userId: userId 
        })

        return this.toItemResponseDTO(item)
    }

    async getUserItems(userId: number, global: boolean): Promise<ItemResponseDTO[]> {
        let items = await this.repository.findByCreator(userId)
        if (global) {
            items = items.concat(await this.repository.findGlobals())
        }

        logger.info("Fetched user items successfully", { 
            userId, 
            global, 
            itemCount: items.length 
        })

        return items.map(item => this.toItemResponseDTO(item))
    }

    async updateItem(userId: number, dto: UpdateItemDTO): Promise<ItemResponseDTO> {
        const item = await this.repository.findById(dto.itemId)
        if (!item) {
            logger.warn("Attempted to update non-existent item", { 
                itemId: dto.itemId, 
                userId 
            })
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== userId) {
            logger.warn("Attempted to update item without permission", { 
                itemId: dto.itemId, 
                userId 
            })
            throw new ForbiddenError("access denied, you are not allowed to update this item")
        }

        if (dto.name && dto.name !== item.name) {
            const exist = await this.repository.existByNameAndCreator(dto.name, userId)
            if (exist) {
                logger.warn("Attempted to update item to a name that already exists", { 
                    itemId: dto.itemId, 
                    userId, 
                    newName: dto.name 
                })
                throw new ConflictError("you already have an item with this name")
            }
        }

        const updated = await this.repository.update(dto)
        logger.info("Item updated successfully", { 
            itemId: updated.id, 
            itemName: updated.name, 
            userId: userId 
        })

        return this.toItemResponseDTO(updated)
    }

    async deleteItem(userId: number, itemId: number) {
        const item = await this.repository.findById(itemId)
        if (!item) {
            logger.warn("Attempted to delete non-existent item", { 
                itemId, 
                userId 
            })
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== userId) {
            logger.warn("Attempted to delete item without permission", { 
                itemId, 
                userId 
            })
            throw new ForbiddenError("access denied, you are not allowed to delete this item")
        }

        await this.repository.delete(itemId)
        logger.info("Item deleted successfully", { 
            itemId, 
            userId 
        })
    }
}