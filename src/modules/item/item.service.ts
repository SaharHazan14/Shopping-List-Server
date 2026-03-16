import { Item } from "../../../generated/prisma/client";
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
        logger.info('Creating item', { name: dto.name, userId: dto.userId })
        const exist = await this.repository.existByNameAndCreator(dto.name, dto.userId)

        if (exist) {
            logger.warn('Item creation conflict - name exists for user', { name: dto.name, userId: dto.userId })
            throw new ConflictError("you already have an item with this name")
        }

        const item = await this.repository.create(dto)
        logger.info('Item created in repository', { id: item.id })
        return this.toItemResponseDTO(item)
    }

    async getItemById(itemId: number, userId: number): Promise<ItemResponseDTO> {
        logger.debug('Getting item from repository', { itemId, userId })
        const item = await this.repository.findById(itemId)
        if (!item) {
            logger.warn('Item not found', { itemId })
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== null && item.creator_id !== userId) {
            throw new ForbiddenError("access denied")
        }

        return this.toItemResponseDTO(item)
    }

    async getUserItems(userId: number, global: boolean): Promise<ItemResponseDTO[]> {
        logger.debug('Fetching user items', { userId, global })
        let items = await this.repository.findByCreator(userId)
        if (global) {
            items = items.concat(await this.repository.findGlobals())
        }

        return items.map(item => this.toItemResponseDTO(item))
    }

    async updateItem(userId: number, dto: UpdateItemDTO): Promise<ItemResponseDTO> {
        logger.info('Updating item in service', { itemId: dto.itemId, userId })
        const item = await this.repository.findById(dto.itemId)
        if (!item) {
            logger.warn('Item to update not found', { itemId: dto.itemId })
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
        logger.info('Item updated in repository', { itemId: updated.id })
        return this.toItemResponseDTO(updated)
    }

    async deleteItem(userId: number, itemId: number) {
        logger.info('Deleting item in service', { itemId, userId })
        const item = await this.repository.findById(itemId)
        if (!item) {
            logger.warn('Item to delete not found', { itemId })
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== userId) {
            throw new ForbiddenError("access denied, you are not allowed to delete this item")
        }

        await this.repository.delete(itemId)
    }
}