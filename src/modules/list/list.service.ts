import { Role } from "../../../generated/prisma/enums";
import { ListRepository } from "./list.repository";

export class ListService {
    constructor(private readonly repo: ListRepository) {}

    async createList(creatorId: number, title: string, description?: string) {
        if (creatorId <= 0) {
            throw new Error("Creator ID must be a positive integer")
        }
        
        if (!title || title.trim() === '') {
            throw new Error("List title is required")
        }

        // check if user exist

        const creatorLists = await this.repo.findByCreator(creatorId)

        for (const list of creatorLists) {
            if (list.title === title) {
                throw new Error("A list with this title already exists")
            }
        }

        return this.repo.create(title, description ?? null, creatorId)
    }

    async getListById(listId: number) {
        return this.repo.findById(listId)
    }

    async getUserLists(userId: number) {  
        return this.repo.findByUser(userId)
    }

    async getCreatorLists(creatorId: number) {
        return this.repo.findByCreator(creatorId)
    }

    async deleteList(userId: number, listId: number) {
        const role = await this.repo.findUserRole(userId, listId)
        
        if (!role || role !== Role.OWNER) {
            throw new Error('Only owners can delete lists')
        }

        await this.repo.delete(listId)
    }
}