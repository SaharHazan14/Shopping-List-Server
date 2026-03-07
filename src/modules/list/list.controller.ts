import { Request, Response } from "express"
import { ListService } from "./list.service"
import { ListRepository } from "./list.repository"
import { CreateListDTO, UpdateListDTO } from "./list.dto"
import { AddListMemberDTO, UpdateListMemberDTO } from "./user-list/user-list.dto"
import { ItemRepository } from "../item/item.repository"
import { UserListRepository } from "./user-list/user-list.repository"
import { ListItemRepository } from "./list-item/list-Item.repository"
import { AddListItemDTO, UpdateListItemDTO } from "./list-item/list-item.dto"
import { UserRepository } from "../user/user.repository"

const service = new ListService(new ListRepository, new ItemRepository, new UserListRepository, new ListItemRepository, new UserRepository())

class ListController {
    async createList(req: Request, res: Response) {
        const dto: CreateListDTO = {
            title: req.body.title,
            description: req.body.description,
            creatorId: req.user.id 
        }
        const list = await service.createList(dto)
        res.status(201).json(list)
    }

    async getListById(req: Request, res: Response) {
        const listId = Number(req.params.listId)
        
        const userId = req.user.id

        const list = await service.getListById(listId, userId)
        res.status(200).json(list)
    }

    async getUserLists(req: Request, res: Response) {
        const includeMember = req.query.includeMember === "true"

        const userId = req.user.id

        const lists = await service.getUserListsWithStats(userId, includeMember)
        res.status(200).json(lists)
    }

    async updateList(req: Request, res: Response) {
        const dto: UpdateListDTO = {
            id: Number(req.params.listId), 
            title: req.body.title,
            description: req.body.description
        }

        const userId = req.user.id

        const updated = await service.updateList(userId, dto)
        res.status(200).json(updated)
    }

    async deleteList(req: Request, res: Response) {
        const listId = Number(req.params.listId)

        const userId = req.user.id

        await service.deleteList(userId, listId)
        res.status(204).send()
    }

    async addListMember(req: Request, res: Response) {
        const dto: AddListMemberDTO = {
            listId: Number(req.params.listId),
            memberId: req.body.memberId,
            role: req.body.role
        }

        const userId = req.user.id

        const listMember = await service.addListMember(dto, userId)
        res.status(201).json(listMember)
    }

    async getListMembers(req: Request, res: Response) {
        const listId = Number(req.params.listId)
        
        const userId = req.user.id

        const listMembers = await service.getListMembers(listId, userId)
        res.status(200).json(listMembers)
    }

    async updateListMember(req: Request, res: Response) {
        const dto: UpdateListMemberDTO = {
            listId: Number(req.params.listId),
            memberId: Number(req.params.memberId),
            role: req.body.role
        }

        const userId = req.user.id

        const updated = await service.updateListMember(dto, userId)
        res.status(200).json(updated)
    }

    async removeListMember(req: Request, res: Response) {
        const listId = Number(req.params.listId)
        const memberId = Number(req.params.memberId)

        const userId = req.user.id

        await service.removeListMember(listId, memberId, userId)
        res.status(204).send()
    }

    async addListItem(req: Request, res: Response) {
        const dto: AddListItemDTO = {
            listId: Number(req.params.listId),
            itemId: req.body.itemId,
            quantity: req.body.quantity,
            isChecked: req.body.isChecked
        }

        const userId = req.user.id

        const listItem = await service.addListItem(dto, userId)
        res.status(201).json(listItem) 
    }

    async getListItems(req: Request, res: Response) {
        const listId = Number(req.params.listId)
        
        const userId = req.user.id

        const listItems = await service.getListItems(listId, userId) 
        res.status(200).json(listItems)
    }

    async updateListItem(req: Request, res: Response) {  
        const dto: UpdateListItemDTO = {
            listId: Number(req.params.listId),
            itemId: Number(req.params.itemId),
            quantity: req.body.quantity,
            isChecked: req.body.isChecked
        }

        const userId = req.user.id

        const updated = await service.updateListItem(dto, userId)
        res.status(200).json(updated)
    }

    async removeListItem(req: Request, res: Response) {
        const listId = Number(req.params.listId)
        const itemId = Number(req.params.itemId)

        const userId = req.user.id

        await service.removeListItem(listId, itemId, userId)
        res.status(204).send()
    }
}

export const listController = new ListController()