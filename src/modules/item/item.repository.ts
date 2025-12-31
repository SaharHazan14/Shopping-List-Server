import { Category, Item } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";

export class ItemRepository {
    async create(
        name: string,
        category: Category,
        image: string | null,
        creatorId: number | null
    ): Promise<Item> {
        return prisma.item.create({
            data: {
                name: name,
                category: category,
                image: image,
                creator_id: creatorId
            }
        })
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
