import { User } from "../../../generated/prisma/client"
import { prisma } from "../../../prisma/prisma"
import { CreateUserDTO } from "./user.dto"
import logger from "../../logger"

export class UserRepository {
    async create(dto: CreateUserDTO): Promise<User> {
        logger.debug('Creating user in database', { cognitoSub: dto.cognitoSub })
        const created = await prisma.user.create({
            data: {
                cognitoSub: dto.cognitoSub,
                email: dto.email
            }
        })
        logger.info('User created', { id: created.id })
        return created
    }

    async findByCognitoSub(cognitoSub: string): Promise<User | null> {
        logger.debug('Finding user by cognitoSub', { cognitoSub })
        return prisma.user.findUnique({
            where: {cognitoSub: cognitoSub}
        })
    }

    async findById(id: number): Promise<User | null> {
        logger.debug('Finding user by id', { id })
        return prisma.user.findUnique({
            where: { id: id }
        })
    }

    async getEmailsByIds(userIds: number[]) {
        logger.debug('Fetching emails for user ids', { userIds })
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