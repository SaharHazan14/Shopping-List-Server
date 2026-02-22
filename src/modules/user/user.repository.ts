import { User } from "../../../generated/prisma/client"
import { prisma } from "../../../prisma/prisma"
import { CreateUserDTO } from "./user.dto"

export class UserRepository {
    async create(dto: CreateUserDTO): Promise<User> {
        return prisma.user.create({
            data: {
                cognitoSub: dto.cognitoSub,
                email: dto.email
            }
        })
    }

    async findByCognitoSub(cognitoSub: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {cognitoSub: cognitoSub}
        })
    }
}