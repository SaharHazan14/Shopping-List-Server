import { User } from "../../../generated/prisma/client";
import { NotFoundError } from "../../errors";
import { CreateUserDTO, DBUserDTO } from "./user.dto";
import { UserRepository } from "./user.repository";
import logger from "../../logger";

export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    private toDBUserDTO(user: User): DBUserDTO {
        return {
            id: user.id,
            cognitoSub: user.cognitoSub,
            email: user.email
        }
    }

    async getOrCreateUser(dto: CreateUserDTO): Promise<DBUserDTO> {
        logger.info('Get or create user', { cognitoSub: dto.cognitoSub })
        const existingUser = await this.userRepository.findByCognitoSub(dto.cognitoSub)
        if (existingUser) {
            logger.debug('User exists, returning existing user', { id: existingUser.id })
            return this.toDBUserDTO(existingUser)
        }

        const created = await this.userRepository.create(dto)
        logger.info('Created new user', { id: created.id })
        return this.toDBUserDTO(created)
    }

    async findByCognitoSub(cognitoSub: string): Promise<DBUserDTO | null> {
        logger.debug('Looking up user by cognitoSub', { cognitoSub })
        const user = await this.userRepository.findByCognitoSub(cognitoSub)
        return user ? this.toDBUserDTO(user) : null
    }

    async findById(id: number): Promise<DBUserDTO> {
        logger.debug('Finding user by id', { id })
        const user = await this.userRepository.findById(id)
        
        if (!user) {
            logger.warn('User not found', { id })
            throw new NotFoundError("User not found")
        }

        return this.toDBUserDTO(user)
    }
}