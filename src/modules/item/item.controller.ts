import { Request, Response } from "express";
import { ItemService } from "./item.service";
import { ItemRepository } from "./item.repository";
import { CreateItemDTO, UpdateItemDTO } from "./item.dto";

const service = new ItemService(new ItemRepository)

class ItemController {
    async createItem(req: Request, res: Response) {
        const dto: CreateItemDTO = {
            name: req.body.name,
            category: req.body.category,
            imageUrl: req.body.url,
            userId: req.user.id
        }

        const item = await service.createItem(dto)
        
        res.status(201).json(item)
    }

    async getItemById(req: Request, res: Response) {
        const itemId = Number(req.params.itemId)

        const userId = req.user.id

        const item = await service.getItemById(itemId, userId)
        res.status(200).json(item)
    }

    async getUserItems(req: Request, res: Response) {
        const global = req.query.global === "true"
        const userId = req.user.id

        const items = await service.getUserItems(userId, global)
        res.status(200).json(items)
    }

    async updateItem(req: Request, res: Response) {
        const dto: UpdateItemDTO =  {
            itemId: Number(req.params.itemId),
            name: req.body.name,
            category: req.body.category,
            imageUrl: req.body.imageUrl
        }

        const userId = req.user.id
        
        const updated = await service.updateItem(userId, dto)
        res.status(200).json(updated)
    }
    
    async deleteItem(req: Request, res: Response) {
        const itemId = Number(req.params.itemId)
        const userId = req.user.id

        await service.deleteItem(userId, itemId)
        res.status(204).send()
    }
}
export const itemController = new ItemController()