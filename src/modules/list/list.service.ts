import { Role } from "../../../generated/prisma/enums";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { ListRepository } from "./list.repository";

export class ListService {
    constructor(private readonly repo: ListRepository) {}

    async createList(creatorId: number, title: string, description?: string) {
        // check if user exist
        
        // Is this validation neccessary?
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

    async getListByTitle(userId: number, title: string) {
        // check user exists

        const list = await this.repo.findByCreatorAndTitle(userId, title)

        if (list === null) {
            throw new NotFoundError("List not found")
        }

        return list
    }

    async getUserLists(userId: number) {
        // check user exists

        return this.repo.findByCreator(userId)

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

    async addListMember(userId: number, listId: number, memberId: number, memberRole: Role) {
        // check both users exist

        const list = await this.repo.findById(listId)

        if (list === null) {
            throw new NotFoundError("List not found")
        }

        const role = await this.repo.findUserRole(userId, listId)
        
        if (!role || role !== Role.OWNER) {
            throw new ForbiddenError("Access denied - only owners can add list members")
        }

        return this.repo.addMember(memberId, listId, memberRole)
    }
}