import { List, Role } from "../../../generated/prisma/client";
import { prisma } from "../../prisma/prisma";
import { CreateListDTO, UpdateListDTO, ListStatsDTO } from "./list.dto";

export class ListRepository {
    async create(dto: CreateListDTO): Promise<List> {
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
        return created
    }

    async existByTitleAndCreator(title: string, creatorId: number): Promise<boolean> {
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
        const result = await prisma.list.findUnique({
        where: { id: listId },
        select: { id: true }
        })

        return result !== null
    }

    async findByCreatorAndTitle(creatorId: number, title: string): Promise<List | null> {
        return prisma.list.findFirst({
            where: {
                creator_id: creatorId,
                title: title
            }
        })
    }

    async findById(listId: number): Promise<List| null> {
        return prisma.list.findUnique({
            where: {id: listId}
        })
    }

    async findByUser(userId: number): Promise<List[]> {
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
        return prisma.list.findMany({
            where: {creator_id: creatorId},
        })
    }

    async update(dto: UpdateListDTO) {
        const updated = await prisma.list.update({
            where: {id: dto.id},
            data: { 
                title: dto.title, 
                description: dto.description
            }
        })
        return updated
    }

    async delete(listId: number): Promise<void> {
        await prisma.list.delete({
            where: {id: listId},
        })
    }
}