import { Request, Response } from "express";
import { ItemService } from "./item.service";
import { ItemRepository } from "./item.repository";
import { Category } from "../../../generated/prisma/enums";

const service = new ItemService(new ItemRepository)

class ItemController {
    /*
    async createNewItem(req: Request, res: Response) {
        // creatorId should be authenticated and extracted from middleware
        // meanwhile creatorId extracted from request body

        const { name, imageUrl, creatorId } = req.body

        // validate name
        
        const category = parseEnum(Category, req.body.category, "category")
        
        // validate imageUrl

        const item = await service.createItem(name, category, creatorId, imageUrl)

        res.status(201).json(item)
    }

    async getItemById(req: Request, res: Response) {
        const itemId = Number(req.params.id)
        const userId = req.body.userId

        if (!Number.isInteger(itemId)) {
            return res.status(400).json({ message: "item ID must be an integer" });
        }

        const item = await service.getItemById(itemId, userId)

        res.status(200).json(item)
    }

    async getGlobalItems(req: Request, res: Response) {
        const userId = req.body.userId

        const items = await service.getGlobalItems(userId)

        res.status(200).json(items)
    }

    async getUserItems(req: Request, res: Response) {
        const userId = req.body.userId

        const items = await service.getUserItems(userId)

        res.status(200).json(items)
    }

    async updateItemName(req: Request, res: Response) {
        const itemId = Number(req.params.id)

        if (!Number.isInteger(itemId)) {
            return res.status(400).json({ message: "item ID must be an integer" });
        }

        const newName = req.body.newName
        // vaidate name 

        const userId = req.body.userId

        const updatedItem = await service.updateItemName(itemId, newName, userId)

        res.status(200).json(updatedItem)
    }

    async deleteItem(req: Request, res: Response) {
        const itemId = Number(req.params.id)

        if (!Number.isInteger(itemId)) {
            return res.status(400).json({ message: "item ID must be an integer" });
        }

        const userId = req.body.userId

        await service.deleteItem(itemId, userId)

        res.status(204).send()
    }
*/
}
export const itemController = new ItemController()