import { List, Role } from "../../../generated/prisma/client";
import { prisma } from "../../../prisma/prisma";
import { CreateListDTO, UpdateListDTO, ListStatsDTO } from "./list.dto";
import logger from "../../logger"

export class ListRepository {
    async create(dto: CreateListDTO): Promise<List> {
        logger.debug('Creating list in DB', { title: dto.title, creatorId: dto.creatorId })
        const created = await prisma.list.create({
            data: {
                title: dto.title,
                description: dto.description,
                creator_id: dto.creatorId,
                users: {
                    create: {
                        user_id: dto.creatorId,
                        role: Role.OWNER
                    }
                }
            }
        })
        logger.info('List created', { id: created.id })
        return created
    }

    async existByTitleAndCreator(title: string, creatorId: number): Promise<boolean> {
        logger.debug('Checking if list title exists for creator', { title, creatorId })
        const result = await prisma.list.findFirst({
            where: {
                title: title,
                creator_id: creatorId
            },
            select: { id: true }
        })

        return result !== null
    } 

    async existById(listId: number): Promise<boolean> {
        logger.debug('Checking if list exists by id', { listId })
        const result = await prisma.list.findUnique({
        where: { id: listId },
        select: { id: true }
        })

        return result !== null
    }

    async findByCreatorAndTitle(creatorId: number, title: string): Promise<List | null> {
        logger.debug('Finding list by creator and title', { creatorId, title })
        return prisma.list.findFirst({
            where: {
                creator_id: creatorId,
                title: title
            }
        })
    }

    async findById(listId: number): Promise<List| null> {
        logger.debug('Finding list by id', { listId })
        return prisma.list.findUnique({
            where: {id: listId}
        })
    }

    async findByUser(userId: number): Promise<List[]> {
        logger.debug('Finding lists for user (including membership)', { userId })
        return prisma.list.findMany({
            where: {
                users: {
                    some: {
                        user_id: userId,
                    }
                },
            },
        })
    }

    async findByCreator(creatorId: number): Promise<List[]> {
        logger.debug('Finding lists by creator', { creatorId })
        return prisma.list.findMany({
            where: {creator_id: creatorId},
        })
    }

    async update(dto: UpdateListDTO) {
        logger.debug('Updating list in DB', { listId: dto.id })
        const updated = await prisma.list.update({
            where: {id: dto.id},
            data: { 
                title: dto.title, 
                description: dto.description
            }
        })
        logger.info('List updated', { id: updated.id })
        return updated
    }

    async delete(listId: number): Promise<void> {
        logger.debug('Deleting list from DB', { listId })
        await prisma.list.delete({
            where: {id: listId},
        })
    }
}