import { Request, Response } from "express"
import { ListService } from "./list.service"
import { ListRepository } from "./list.repository"
import { CreateListDTO } from "./dto/create-list.dto"
import { UpdateListDTO } from "./dto/update-list.dto"

const service = new ListService(new ListRepository)

class ListController {
    async createList(req: Request, res: Response) {
        const dto: CreateListDTO = {
            title: req.body.title,
            description: req.body.description,
            userId: req.body.userId // req.user.id 
        }

        const list = await service.createList(dto)
        res.status(201).json(list)
    }

    async getListById(req: Request, res: Response) {
        const listId = Number(req.params.id)
        
        const userId = req.body.userId // req.user.id

        const list = await service.getListById(listId, userId)
        res.status(200).json(list)
    }

    async getUserLists(req: Request, res: Response) {
        const includeMember = req.query.includeMember

        const userId = req.body.userId // req.user.id

        const lists = await service.getUserLists(userId, Boolean(includeMember))
        res.status(200).json(lists)
    }

    async updateList(req: Request, res: Response) {
        const listId = Number(req.params.id)
        const { title, description } = req.body

        const dto: UpdateListDTO = {
            listId: listId, 
            title: title,
            description: description
        }

        const userId = req.body.userId // req.user.id

        const updated = await service.updateList(userId, dto)
        res.status(200).json(updated)
    }

    async deleteList(req: Request, res: Response) {
        const listId = Number(req.params)

        const userId = req.body.userId // req.user.id

        await service.deleteList(userId, listId)
        res.status(204).send()
    }

    async addListMember(req: Request, res: Response) {
        
    }

    /*
    async addListMember(req: Request, res: Response) {
        // User should be authenticated
        const userId = req.body.userId

        const listId = requiredIntParam(req.params.id, "id")
        const memberId = requiredPositiveInt(req.body.memberId, "memberId")
        const memberRole = parseEnum(Role, req.body.memberRole, "memberRole")

        const listMember = await service.addListMember(userId, listId, memberId, memberRole)

        res.status(201).json(listMember)
    }

    async getListMembers(req: Request, res: Response) {
        // User should be authenticated
        const userId = req.body.userId

        const listId = requiredIntParam(req.params.id, "id")

        const listMembers = await service.getListMembers(userId, listId)

        res.status(200).json(listMembers)
    }

    async getUserListMemberships(req: Request, res: Response) {
        const userId = req.body.userId

        const userMemberships = await service.getUserListMemberships(userId)

        res.status(200).json(userMemberships)
    }

    async updateMemberRole(req: Request, res: Response) {
        const userId = req.body.userId

        const listId = requiredIntParam(req.params.id, "id")
        const memberId = requiredPositiveInt(req.body.memberId, "memberId")
        const memberRole = parseEnum(Role, req.body.memberRole, "memberRole")

        const updatedRole = await service.updateMemberRole(userId, listId, memberId, memberRole)
        
        res.status(200).json(updatedRole)
    }

    async removeListMember(req: Request, res: Response) {
        const userId = req.body.userId

        const listId = requiredIntParam(req.params.id, "id")
        const memberId = requiredIntParam(req.params.memberId, "memberId")

        await service.removeMember(userId, listId, memberId)

        res.status(204).send()
    }

    async leaveList(req: Request, res: Response) {
        
    }
    */
}

export const listController = new ListController()