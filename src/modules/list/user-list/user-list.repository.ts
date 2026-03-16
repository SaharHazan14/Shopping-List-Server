import { Role, UserList } from "../../../../generated/prisma/client";
import { prisma } from "../../../../prisma/prisma";
import { AddListMemberDTO, UpdateListMemberDTO } from "./user-list.dto"
import logger from "../../../logger"

export class UserListRepository {
    async create(dto: AddListMemberDTO): Promise<UserList> {
        logger.debug('Creating user-list entry', { listId: dto.listId, memberId: dto.memberId })
        const created = await prisma.userList.create({
            data: {
                user_id: dto.memberId,
                list_id: dto.listId,
                role: dto.role
            }
        })
        logger.info('User-list entry created', { listId: created.list_id, memberId: created.user_id })
        return created
    }

    // New API to get list members with their emails
    async findListMembersByListId(listId: number): Promise<{ listId: number; memberId: number; role: Role; email: string }[]> {
        logger.debug('Fetching list members from DB', { listId })
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

        return rows.map(r => ({
            listId: r.list_id,
            memberId: r.user_id,
            role: r.role,
            email: r.user.email
        }))
    }

    async findByListId(listId: number): Promise<UserList[]> {
        logger.debug('Finding user-list entries by list id', { listId })
        return prisma.userList.findMany({
            where: {
                list_id: listId
            }
        })
    }

    async findUserRole(userId: number, listId: number): Promise<Role | null> {
        logger.debug('Finding user role for list', { userId, listId })
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
        logger.debug('Updating user-list role', { listId: dto.listId, memberId: dto.memberId, role: dto.role })
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
        logger.info('User-list role updated', { listId: updated.list_id, memberId: updated.user_id, role: updated.role })
        return updated
    }

    async delete(userId: number, listId: number) {
        logger.debug('Deleting user-list entry', { listId, userId })
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