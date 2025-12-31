import { Request, Response, NextFunction } from "express"
import { ListService } from "./list.service"
import { ListRepository } from "./list.repository"
import { optionalString, parseStringQuery, requiredIntParam, requiredNonEmptyString, requiredPositiveInt } from "../../validations/common.validations"
import { parseEnum } from "../../utils/parse-enum"
import { Role } from "../../../generated/prisma/enums"

const service = new ListService(new ListRepository)

class ListController {
    async createList(req: Request, res: Response) {
        // creatorId should be authenticated and extracted from middleware
        // meanwhile creatorId extracted from request body
        const creatorId = req.body.creatorId
        
        const title = requiredNonEmptyString(req.body.title, "title")
        const description = optionalString(req.body.description, "description")
    
        const list = await service.createList(creatorId, title, description)

        res.status(201).json(list)            
    }

    async getListById(req: Request, res: Response) {
        // User should be authenticated
        const userId = req.body.userId

        const listId = requiredIntParam(req.params.id, "id")

        const list = await service.getListById(listId, userId)
            
        res.status(200).json(list)
    }

    async getUserLists(req: Request, res: Response) {
        // User should be authenticated
        const userId = req.body.userId

        const title = parseStringQuery(req.query.title, "title")

        if (title) {
            const list = await service.getListByTitle(userId, title)
            res.status(200).json(list)
        } else {
            const lists = await service.getUserLists(userId)
            res.status(200).json(lists)
        }
    }

    async updateListTitle(req: Request, res: Response) {
        // User should be authenticated
        const userId = req.body.userId
        
        const listId = requiredIntParam(req.params.id, "id")
        const newTitle = requiredNonEmptyString(req.body.newTitle, "newTitle")

        const updatedList = await service.updateListTitle(userId, listId, newTitle)
            
        res.status(200).json(updatedList)
    }

    async deleteList(req: Request, res: Response) {
        // User should be authenticated
        const userId = req.body.userId
        
        const listId = requiredIntParam(req.params.id, "id")

        await service.deleteList(userId, Number(listId))
            
        res.status(204).send()
    }

    async addListMember(req: Request, res: Response) {
        // User should be authenticated
        const userId = req.body.userId

        const listId = requiredIntParam(req.params.id, "id")
        const memberId = requiredPositiveInt(req.body.memberId, "memberId")
        const memberRole = parseEnum(Role, req.body.memberRole, "memberRole")

        const listMember = await service.addListMember(userId, listId, memberId, memberRole)

        res.status(201).json(listMember)
    }
}

export const listController = new ListController()