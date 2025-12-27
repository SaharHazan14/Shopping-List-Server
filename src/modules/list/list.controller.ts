import { Request, Response, NextFunction } from "express"
import { ListService } from "./list.service"
import { ListRepository } from "./list.repository"

const service = new ListService(new ListRepository)

class ListController {
    async createList(req: Request, res: Response, next: NextFunction) {
        // creatorId should be authenticated and extracted from middleware
        // meanwhile creatorId extracted from request body
        const { title, description, creatorId } = req.body

        if (title === undefined) {
            return res.status(400).json({ message: "Missing required field: title" });
        }

        if (typeof title !== "string") {
            return res.status(400).json({ message: "Field 'title' must be a string" });
        }

        try {
            const list = await service.createList(creatorId, title, description)

            res.status(201).json(list)            
        } catch (err) {
            next(err)
        }
    }

    async getListById(req: Request, res: Response, next: NextFunction) {
        // User should be authenticated

        const listId = Number(req.params.id)
        const userId = req.body.userId

        if (!Number.isInteger(listId)) {
            return res.status(400).json({ message: "listId must be an integer" });
        }

        try {
            const list = await service.getListById(Number(listId), userId)
            
            res.status(200).json(list)
        } catch (err) {
            next(err)
        }
    }

    async getUserLists(req: Request, res: Response, next: NextFunction) {
        // User should be authenticated
        const userId = req.body.userId
        const shared = req.query.shared
        let sharedParam: boolean
            
        if (shared === undefined) {
            sharedParam = true
        } else if (shared !== "true" && shared !== "false") {
            return res.status(400).json({ message: "parameter 'shared' must be either 'true' or 'false'"})
        } else {
            sharedParam = shared === "true"
        }

        try {
            const lists = await service.getUserLists(userId, sharedParam)

            res.status(200).json(lists)
        } catch (err) {
            next(err)
        }
    }

    async updateListTitle(req: Request, res: Response, next: NextFunction) {
        // User should be authenticated
        const userId = req.body.userId
        const listId = Number(req.params.id)
        const newTitle = req.body.newTitle

        if (!Number.isInteger(listId)) {
            return res.status(400).json({ message: "listId must be an integer" });
        }

        if (newTitle === undefined) {
            return res.status(400).json({ message: "Missing required field: newTitle" });
        }
        
        if (typeof newTitle !== "string") {
            return res.status(400).json({ message: "Field 'newTitle' must be a string" });
        }

        try {
            const updatedList = await service.updateListTitle(userId, listId, newTitle)
            
            res.status(200).json(updatedList)
        } catch (err) {
            next(err)
        }
    }

    async deleteList(req: Request, res: Response, next: NextFunction) {
        // User should be authenticated
        const userId = req.body.userId
        const listId = Number(req.params.id)

        if (!Number.isInteger(listId)) {
            return res.status(400).json({ message: "listId must be an integer" });
        }

        try {
            await service.deleteList(userId, Number(listId))
            
            res.status(204).send()
        } catch (err) {
            next(err)
        }
    }
}

export const listController = new ListController()