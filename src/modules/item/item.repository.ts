import { Category, Item } from "../../../generated/prisma/client";
import { prisma } from "../../../prisma/prisma";
import { CreateItemDTO } from "./dto/create-item.dto";
import { UpdateItemDTO } from "./dto/update-item.dto";

export class ItemRepository {
    async create(dto : CreateItemDTO): Promise<Item> {
        return prisma.item.create({
            data: {
                name: dto.name,
                category: dto.category,
                image: dto.imageUrl,
                creator_id: dto.userId
            }
        })
    }

    async existByNameAndCreator(name: string, creatorId: number): Promise<boolean> {
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
        return prisma.item.findMany({
            where: {creator_id: null}
        })
    }

    async findByCategory(category: Category): Promise<Item[]> {
        return prisma.item.findMany({
            where: {category: category}
        })
    }

    async findById(itemId: number): Promise<Item | null> {
        return prisma.item.findUnique({
            where: {id: itemId}
        })
    }

    async findByCreator(creatorId: number): Promise<Item[]> {
        return prisma.item.findMany({
            where: {creator_id: creatorId}
        })
    }

    async findByCreatorAndName(creatorId: number, name: string): Promise<Item | null> {
        return prisma.item.findFirst({
            where: {
                name: name,
                creator_id: creatorId,
            }
        })
    }

    async update(dto: UpdateItemDTO): Promise<Item> {
        return prisma.item.update({
            where: {id: dto.itemId},
            data: {
                name: dto.name,
                category: dto.category,
                image: dto.imageUrl
            }
        })
    }

    async updateName(itemId: number, newName: string) {
        return prisma.item.update({
            where: {id: itemId},
            data: {name: newName}
        })
    }

    async delete(itemId: number): Promise<void> {
        await prisma.item.delete({
            where: {id: itemId}
        })
    }
}
