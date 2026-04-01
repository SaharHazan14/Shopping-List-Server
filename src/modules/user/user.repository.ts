import { User } from "@prisma/client"
import { prisma } from "../../prisma.js"
import { CreateUserDTO } from "./user.dto.js"

export class UserRepository {
    async create(dto: CreateUserDTO): Promise<User> {
        const created = await prisma.user.create({
            data: {
                cognitoSub: dto.cognitoSub,
                email: dto.email
            }
        })
        return created
    }

    async findByCognitoSub(cognitoSub: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {cognitoSub: cognitoSub}
        })
    }

    async findById(id: number): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id: id }
        })
    }

    async getEmailsByIds(userIds: number[]) {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select: {
                id: true,
                email: true
            }
        })

        const emailMap = new Map<number, string>();

        for (const user of users) {
            emailMap.set(user.id, user.email);
        }

        return emailMap
    }
}