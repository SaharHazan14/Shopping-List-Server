import { Request, Response } from "express";
import { ItemService } from "./item.service";
import { ItemRepository } from "./item.repository";
import { CreateItemDTO, UpdateItemDTO } from "./item.dto";
import logger from "../../logger";

const service = new ItemService(new ItemRepository)

class ItemController {
    async createItem(req: Request, res: Response) {
        const dto: CreateItemDTO = {
            name: req.body.name,
            category: req.body.category,
            imageUrl: req.body.url,
            userId: req.user.id
        }

        logger.info('Creating item', { name: dto.name, userId: dto.userId })
        const item = await service.createItem(dto)
        logger.debug('Item created', { itemId: item.id })
        res.status(201).json(item)
    }

    async getItemById(req: Request, res: Response) {
        const itemId = Number(req.params.itemId)

        const userId = req.user.id

        logger.info('Getting item by id', { itemId, userId })
        const item = await service.getItemById(itemId, userId)
        res.status(200).json(item)
    }

    async getUserItems(req: Request, res: Response) {
        const global = req.query.global === "true"
        const userId = req.user.id

        logger.info('Listing user items', { userId, global })
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
        
        logger.info('Updating item', { itemId: dto.itemId, userId })
        const updated = await service.updateItem(userId, dto)
        logger.debug('Item updated', { itemId: updated.id })
        res.status(200).json(updated)
    }
    
    async deleteItem(req: Request, res: Response) {
        const itemId = Number(req.params.itemId)
        const userId = req.user.id

        logger.info('Deleting item', { itemId, userId })
        await service.deleteItem(userId, itemId)
        logger.debug('Item deleted', { itemId })
        res.status(204).send()
    }
}
export const itemController = new ItemController()