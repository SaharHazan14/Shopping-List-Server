import { Role, UserList } from "../../../generated/prisma/client";
import { prisma } from "../../../prisma/prisma";
import { AddListMemberDTO } from "./dto/add-list-member.dto";
import { UpdateListMemberDTO } from "./dto/update-list-member.dto";

export class UserListRepository {
    async create(dto: AddListMemberDTO): Promise<UserList> {
        return prisma.userList.create({
            data: {
                user_id: dto.memberId,
                list_id: dto.listId,
                role: dto.memberRole
            }
        })
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
        return prisma.userList.update({
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