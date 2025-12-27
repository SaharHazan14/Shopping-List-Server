import { Role } from "../../../generated/prisma/enums";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { ListRepository } from "./list.repository";

export class ListService {
    constructor(private readonly repo: ListRepository) {}

    async createList(creatorId: number, title: string, description?: string) {
        // check if user exist
        
        if (!title || title.trim() === '') {
            throw new BadRequestError("List title is required")
        }

        const existing = await this.repo.findByCreatorAndTitle(creatorId, title)

        if (existing) {
            throw new BadRequestError("You already have a list with this title")
        }

        return this.repo.create(title, description ?? null, creatorId)
    }

    async getListById(listId: number, userId: number) {
        // check user exists

        const role = await this.repo.findUserRole(userId, listId)

        if (role === null) {
            throw new ForbiddenError("Access denied")
        }

        const list = await this.repo.findById(listId)
        
        if (list === null) {
            throw new NotFoundError("List not found")
        }

        return list
    }

    async getUserLists(userId: number, shared: boolean = true) {
        // check user exists
        if (!shared) {
            return this.repo.findByCreator(userId)
        }

        return this.repo.findByUser(userId)
    }

    async updateListTitle(userId: number, listId: number, newTitle: string) {
        // check user exists

        const list = await this.repo.findById(listId)

        if (list === null) {
            throw new NotFoundError("List not found")
        }

        const role = await this.repo.findUserRole(userId, listId)

        if (role !== Role.OWNER) {
            throw new ForbiddenError("Access denied - only owners can change list's name")
        }

        if (!newTitle || newTitle.trim() === '') {
            throw new BadRequestError("List title is required")
        }

        const existing = await this.repo.findByCreatorAndTitle(userId, newTitle)

        if (existing) {
            throw new BadRequestError("You already have a list with this title")
        }

        return this.repo.updateName(listId, newTitle)
    }

    async deleteList(userId: number, listId: number) {
        // check user exists
        const list = await this.repo.findById(listId)

        if (list === null) {
            throw new NotFoundError("List not found")
        }

        const role = await this.repo.findUserRole(userId, listId)
        
        if (!role || role !== Role.OWNER) {
            throw new ForbiddenError("Access denied - only owners can delete list")
        }

        await this.repo.delete(listId)
    }
}