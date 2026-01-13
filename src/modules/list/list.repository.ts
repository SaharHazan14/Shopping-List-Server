import { List, Role, UserList } from "../../../generated/prisma/client";
import { prisma } from "../../../prisma/prisma";
import { CreateListDTO } from "./dto/create-list.dto";
import { UpdateListDTO } from "./dto/update-list.dto";

export class ListRepository {
    async create(dto: CreateListDTO): Promise<List> {
        return prisma.list.create({
            data: {
                title: dto.title,
                description: dto.description,
                creator_id: dto.userId,
                users: {
                    create: {
                        user_id: dto.userId,
                        role: Role.OWNER
                    }
                }
            }
        })
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

    async update(dto: UpdateListDTO) {
        return prisma.list.update({
            where: {id: dto.listId},
            data: { 
                title: dto.title, 
                description: dto.description
            }
        })
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

    async addMember(userId: number, listId: number, role: Role): Promise<UserList> {
        return prisma.userList.create({
            data: {
                user_id: userId,
                list_id: listId,
                role: role
            }
        })
    }

    async findMembers(listId: number): Promise<UserList[]> {
        return prisma.userList.findMany({
            where: {list_id: listId}
        })
    }

    async findUserMemberships(userId: number): Promise<UserList[]> {
        return prisma.userList.findMany({
            where: {
                user_id: userId
            }
        })
    }

    async updateMemberRole(userId: number, listId: number, newRole: Role) {
        return prisma.userList.update({
            where: {
                user_id_list_id: {
                    user_id: userId,
                    list_id: listId,
                },
            },
            data: {
                role: newRole
            }
        })
    }

    async removeMember(userId: number, listId: number) {
        await prisma.userList.delete({
            where: {
                user_id_list_id: {
                    user_id: userId,
                    list_id: listId
                }
            }
        })
    }
}