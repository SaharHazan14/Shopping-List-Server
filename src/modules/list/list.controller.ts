import { Request, Response } from "express"
import { ListService } from "./list.service"
import { ListRepository } from "./list.repository"
import { error } from "console"

const service = new ListService(new ListRepository)

class ListController {
    async createNewList(req: Request, res: Response) {
        const { title, description, creatorId } = req.body

        if (title === undefined) {
            return res.status(400).json({ message: "Missing required field: title" });
        }
        
        if (typeof title !== "string") {
            return res.status(400).json({ message: "Field 'title' must be a string" });
        }

        if (description === undefined) {
            let description = null
        }

        if (creatorId === undefined) {
            return res.status(400).json({ message: "Missing required field: creatorId" });
        }

        if (typeof creatorId !== "number") {
            return res.status(400).json({ message: "Field 'creatorId' must be a number" });
        }

        try {
            const list = await service.createList(creatorId, title, description)
            res.status(201).json(list)            
        } catch (err: any) {
            res.status(400).json({error: err.message})
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const listId = Number(req.query.id)
            const list = await service.getListById(listId)
            if (!list) {
                res.status(404).json({error: "list not found"})
            }
            else {
                res.status(200).json(list)
            }

        } catch (err: any) {
            res.status(400).json({error: err.message})
        }
    }

    async getUserLists(req: Request, res: Response) {

    }
}

export const listController = new ListController()