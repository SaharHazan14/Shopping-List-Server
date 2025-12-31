import { List, Role, UserList } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";

export class ListRepository {
    async create(
        title: string, 
        description: string | null, 
        creatorId: number
    ): Promise<List> {
        return prisma.list.create({
            data: {
                title: title,
                description: description,
                creator_id: creatorId,
                users: {
                    create: {
                        user_id: creatorId,
                        role: Role.OWNER,
                    },
                },
            },
        })
    }

    async findByCreatorAndTitle(creatorId: number, title: string): Promise<List | null> {
        return prisma.list.findFirst({
            where: {
                creator_id: creatorId,
                title: title
            },
        })
    }

    async findById(listId: number): Promise<List| null> {
        return prisma.list.findUnique({
            where: {id: listId},
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

    async findUserRole(
        userId: number, 
        listId: number
    ): Promise<Role | null> {
        const record = await prisma.userList.findUnique({
            where: {
                user_id_list_id: {
                    user_id: userId,
                    list_id: listId,
                },
            },
        })
        return record?.role ?? null
    }

    async updateName(listId: number, name: string) {
        return prisma.list.update({
            where: { id: listId },
            data: { title: name },
        });
    }

    async delete(listId: number): Promise<void> {
        await prisma.list.delete({
            where: {id: listId},
        })
    }

    async addMember(userId: number, listId: number, role: Role): Promise<UserList>{
        return prisma.userList.create({
            data: {
                user_id: userId,
                list_id: listId,
                role: role
            }
        })
    }
}