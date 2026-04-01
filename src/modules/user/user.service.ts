import { User } from "../../generated/prisma/client";
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
        const existingUser = await this.userRepository.findByCognitoSub(dto.cognitoSub)
        if (existingUser) {
            logger.info("Fetched existing user successfully", { 
                id: existingUser.id, 
                email: existingUser.email 
            })
            return this.toDBUserDTO(existingUser)
        }

        const created = await this.userRepository.create(dto)
        logger.info("New user created successfully", { 
            id: created.id,
            email: created.email
         })

        return this.toDBUserDTO(created)
    }

    async findByCognitoSub(cognitoSub: string): Promise<DBUserDTO | null> {
        const user = await this.userRepository.findByCognitoSub(cognitoSub)
        return user ? this.toDBUserDTO(user) : null
    }

    async findById(id: number): Promise<DBUserDTO> {
        const user = await this.userRepository.findById(id)
        
        if (!user) {
            logger.warn("Attempted to fetch non-existent user", { 
                userId: id
            })
            throw new NotFoundError("User not found")
        }

        logger.info("Fetched user successfully", {
            userId: user.id,
            email: user.email
        })

        return this.toDBUserDTO(user)
    }
}