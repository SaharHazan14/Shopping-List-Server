import { Role, UserList } from "../../../generated/prisma/client";
import { prisma } from "../../../prisma/prisma";
import { AddListMemberDTO, UpdateListMemberDTO } from "./user-list.dto"

export class UserListRepository {
    async create(dto: AddListMemberDTO): Promise<UserList> {
        const created = await prisma.userList.create({
            data: {
                user_id: dto.memberId,
                list_id: dto.listId,
                role: dto.role
            }
        })
        return created
    }

    // New API to get list members with their emails
    async findListMembersByListId(listId: number): Promise<{ listId: number; memberId: number; role: Role; email: string }[]> {
        const rows = await prisma.userList.findMany({
            where: {
                list_id: listId
            },
            include: {
                user: {
                    select: { email: true }
                }
            }
        })

        return rows.map((r: UserList & { user: { email: string } }) => ({
            listId: r.list_id,
            memberId: r.user_id,
            role: r.role,
            email: r.user.email
        }))
    }

    async findByListId(listId: number): Promise<UserList[]> {
        return prisma.userList.findMany({
            where: {
                list_id: listId
            }
        })
    }

    async findUserRole(userId: number, listId: number): Promise<Role | null> {
        const role = await prisma.userList.findUnique({
            where: {
                user_id_list_id: {
                    user_id: userId,
                    list_id: listId
                }
            },
            select: {role: true}
        })

        return role?.role ?? null
    }

    async update(dto: UpdateListMemberDTO): Promise<UserList> {
        const updated = await prisma.userList.update({
            where: {
                user_id_list_id: {
                    user_id: dto.memberId,
                    list_id: dto.listId
                }
            },
            data: {
                role: dto.role
            }
        })
        return updated
    }

    async delete(userId: number, listId: number) {
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