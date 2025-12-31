import { Category } from "../../../generated/prisma/enums";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { ItemRepository } from "./item.repository";

export class ItemService{
    constructor(private readonly repo: ItemRepository) {}

    async createItem(name: string, category: Category, creatorId: number, image?: string) { 
        // check user exists

        if (!name || name.trim() === '') {
            throw new BadRequestError("Item name is required")
        }

        const exists = await this.repo.findByCreatorAndName(creatorId, name)

        if (exists) {
            throw new BadRequestError("You already have an item with this name")
        }

        return this.repo.create(name, category, image ?? null, creatorId)
    }

    async getItemById(itemId: number, userId: number) {
        // check user exists

        const item = await this.repo.findById(itemId) 

        if (!item) {
            throw new NotFoundError("Item not found")
        }

        if (item.creator_id !== null && item.creator_id !== userId) {
            throw new ForbiddenError("Access denied")
        }

        return item
    }

    async getGlobalItems(userId: number) {
        // check user exists
        
        return this.repo.findGlobals()
    }
    
    async getUserItems(userId: number) {
        // check user exists

        return this.repo.findByCreator(userId)
    }

    async updateItemName(itemId: number, newName: string, userId: number) {
        // user exists

        const item = await this.repo.findById(itemId)

        if (!item) {
            throw new NotFoundError("Item not found")
        }

        if (item.creator_id !== userId) {
            throw new ForbiddenError("Access denied - you are not allowed to change this item's name")
        }

        if (!newName || newName.trim() === '') {
            throw new BadRequestError("Item name is required")
        }

        const exists = await this.repo.findByCreatorAndName(userId, newName)

        if (exists) {
            throw new BadRequestError("You already have an item with this name")
        }

        return this.repo.updateName(itemId, newName)
    }

    async deleteItem(itemId: number, userId: number) {
        // user exists

        const item = await this.repo.findById(itemId)

        if (!item) {
            throw new NotFoundError("Item not found")
        }

        if (item.creator_id !== userId) {
            throw new ForbiddenError("Access denied - you are not allowed to delete this item")
        }

        await this.repo.delete(itemId)
    }
}