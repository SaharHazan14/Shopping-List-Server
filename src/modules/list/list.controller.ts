import { Request, Response } from "express"
import { ListService } from "./list.service"
import { ListRepository } from "./list.repository"
import { CreateListDTO } from "./dto/create-list.dto"
import { UpdateListDTO } from "./dto/update-list.dto"
import { AddListMemberDTO } from "./dto/add-list-member.dto"
import { UpdateListMemberDTO } from "./dto/update-list-member.dto"

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
        const includeMember = req.query.includeMember === "true"

        const userId = req.body.userId // req.user.id

        const lists = await service.getUserLists(userId, includeMember)
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
        const listId = Number(req.params.id)

        const userId = req.body.userId // req.user.id

        await service.deleteList(userId, listId)
        res.status(204).send()
    }

    // User - List

    async addListMember(req: Request, res: Response) {
        const listId = Number(req.params.id)
        const { memberId, memberRole } = req.body
        
        const dto: AddListMemberDTO = {
            listId: listId,
            memberId: memberId,
            memberRole: memberRole
        }
        
        const userId = req.body.userId // req.user.id

        const listMember = await service.addListMember(dto, userId)
        res.status(201).json(listMember)
    }

    async getListMembers(req: Request, res: Response) {
        const listId = Number(req.params.id)
        
        const userId = req.body.userId // req.user.id

        const listMembers = await service.getListMembers(listId, userId)
        res.status(200).json(listMembers)
    }

    async updateListMember(req: Request, res: Response) {
        const listId = Number(req.params.listId)
        const memberId = Number(req.params.memberId)

        const role = req.body.role

        const userId = req.body.userId // req.user.id

        const dto: UpdateListMemberDTO = {
            listId: listId,
            memberId: memberId,
            role: role
        }

        const updated = await service.updateListMember(dto, userId)
        res.status(200).json(updated)
    }

    async removeListMember(req: Request, res: Response) {
        const listId = Number(req.params.listId)
        const memberId = Number(req.params.memberId)

        const userId = req.body.userId // req.user.id

        await service.removeListMember(listId, memberId, userId)
        res.status(204).send()
    }
}

export const listController = new ListController()