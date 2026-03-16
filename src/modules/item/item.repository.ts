import { Category, Item } from "../../../generated/prisma/client";
import { prisma } from "../../../prisma/prisma";
import { CreateItemDTO, UpdateItemDTO } from "./item.dto";
import logger from "../../logger"

export class ItemRepository {
    async create(dto : CreateItemDTO): Promise<Item> {
        logger.debug('Creating item in DB', { name: dto.name, userId: dto.userId })
        const created = await prisma.item.create({
            data: {
                name: dto.name,
                category: dto.category,
                image: dto.imageUrl,
                creator_id: dto.userId
            }
        })
        logger.info('Item created', { id: created.id })
        return created
    }

    async existByNameAndCreator(name: string, creatorId: number): Promise<boolean> {
        logger.debug('Checking if item exists by name and creator', { name, creatorId })
        const result = await prisma.item.findFirst({
            where: {
                name: name,
                creator_id: creatorId
            },
            select: {name: true}
        })

        return result !== null
    }

    async findGlobals(): Promise<Item[]> {
        logger.debug('Fetching global items')
        return prisma.item.findMany({
            where: {creator_id: null}
        })
    }

    async findByCategory(category: Category): Promise<Item[]> {
        logger.debug('Finding items by category', { category })
        return prisma.item.findMany({
            where: {category: category}
        })
    }

    async findById(itemId: number): Promise<Item | null> {
        logger.debug('Finding item by id', { itemId })
        return prisma.item.findUnique({
            where: {id: itemId}
        })
    }

    async findByCreator(creatorId: number): Promise<Item[]> {
        logger.debug('Finding items by creator', { creatorId })
        return prisma.item.findMany({
            where: {creator_id: creatorId}
        })
    }

    async findByCreatorAndName(creatorId: number, name: string): Promise<Item | null> {
        logger.debug('Finding item by creator and name', { creatorId, name })
        return prisma.item.findFirst({
            where: {
                name: name,
                creator_id: creatorId,
            }
        })
    }

    async update(dto: UpdateItemDTO): Promise<Item> {
        logger.debug('Updating item in DB', { itemId: dto.itemId })
        const updated = await prisma.item.update({
            where: {id: dto.itemId},
            data: {
                name: dto.name,
                category: dto.category,
                image: dto.imageUrl
            }
        })
        logger.info('Item updated', { id: updated.id })
        return updated
    }

    async updateName(itemId: number, newName: string) {
        logger.debug('Updating item name', { itemId, newName })
        return prisma.item.update({
            where: {id: itemId},
            data: {name: newName}
        })
    }

    async delete(itemId: number): Promise<void> {
        logger.debug('Deleting item from DB', { itemId })
        await prisma.item.delete({
            where: {id: itemId}
        })
    }
}
