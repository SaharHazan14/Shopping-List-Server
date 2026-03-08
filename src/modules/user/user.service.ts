import { User } from "../../../generated/prisma/client";
import { NotFoundError } from "../../errors";
import { CreateUserDTO, DBUserDTO } from "./user.dto";
import { UserRepository } from "./user.repository";

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
            return this.toDBUserDTO(existingUser)
        }

        return this.toDBUserDTO(await this.userRepository.create(dto))
    }

    async findByCognitoSub(cognitoSub: string): Promise<DBUserDTO | null> {
        const user = await this.userRepository.findByCognitoSub(cognitoSub)
        return user ? this.toDBUserDTO(user) : null
    }

    async findById(id: number): Promise<DBUserDTO> {
        const user = await this.userRepository.findById(id)
        
        if (!user) {
            throw new NotFoundError("User not found")
        }

        return this.toDBUserDTO(user)
    }
}