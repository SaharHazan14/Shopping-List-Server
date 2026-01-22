import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateListDTO } from "./dto/create-list.dto";
import { UpdateListDTO } from "./dto/update-list.dto";
import { ListResponseDTO } from "./dto/list-response.dto";
import { ListRepository } from "./list.repository";
import { AddListMemberDTO } from "./dto/add-list-member.dto";
import { Role } from "../../../generated/prisma/enums";
import { ListMemberResponseDTO } from "./dto/list-member-response.dto";
import { UpdateListMemberDTO } from "./dto/update-list-member.dto";

export class ListService {
    constructor(private readonly repository: ListRepository) {}

    async createList(dto: CreateListDTO): Promise<ListResponseDTO> {
        const exist =  await this.repository.existByTitleAndCreator(dto.title, dto.userId)
        if (exist) {
            throw new ConflictError("you already have a list with this title")
        }

        const list = await this.repository.create(dto)
        return {
            id: list.id,
            title: list.title,
            description: list.description,
            creatorId: list.creator_id
        }
    }
    
    async getListById(listId: number, userId: number): Promise<ListResponseDTO> {
        const list = await this.repository.findById(listId) 
        if (!list) {
            throw new NotFoundError("list not found")
        }

        const userRole = await this.repository.findUserRole(userId, listId)
        if (userRole === null) {
            throw new ForbiddenError("access denied")
        }

        return {
            id: list.id,
            title: list.title,
            description: list.description,
            creatorId: list.creator_id
        }
    }

    async getUserLists(userId: number, includeMember: boolean): Promise<ListResponseDTO[]> {
        const lists = includeMember 
            ? await this.repository.findByUser(userId) 
            : await this.repository.findByCreator(userId)

        return lists.map(list => ({
            id: list.id,
            title: list.title,
            description: list.description,
            creatorId: list.creator_id
        }))
    }

    async updateList(userId: number, dto: UpdateListDTO): Promise<ListResponseDTO> {
        const list = await this.repository.findById(dto.listId) 
        if (!list) {
            throw new NotFoundError("list not found")
        }

        if (list.creator_id !== userId) {
            throw new ForbiddenError("access denied, you are not allowed to update this list")
        }

        if (dto.title && dto.title !== list.title) {
            const exist = await this.repository.findByCreatorAndTitle(userId, dto.title)
            if (exist) {
                throw new ConflictError("you already have a list with this title")
            }
        }

        const updated = await this.repository.update(dto)

        return {
            id: updated.id,
            title: updated.title,
            description: updated.description,
            creatorId: updated.creator_id
        }
    }

    async deleteList(userId: number, listId: number): Promise<void> {
        const list = await this.repository.findById(listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        if (list.creator_id !== userId) {
            throw new ForbiddenError("access denied, you are not allowed to delete this list")
        }

        await this.repository.delete(listId)
    }

    // User - List

    async addListMember(dto: AddListMemberDTO, userId: number): Promise<ListMemberResponseDTO> {        
        const exist = await this.repository.existById(dto.listId)
        if (!exist) {
            throw new NotFoundError("list not found")
        }

        const userRole = await this.repository.findUserRole(userId, dto.listId)
        if (userRole != Role.OWNER) {
            throw new ForbiddenError("access denied, only owners allowed to add members")
        }

        const memberRole = await this.repository.findUserRole(dto.memberId, dto.listId)
        if (memberRole !== null) {
            throw new ConflictError("member already has a role")
        }

        const listMember = await this.repository.addMember(dto)

        return {
            listId: listMember.list_id,
            memberId: listMember.user_id,
            role: listMember.role
        }
    }

    async getListMembers(listId: number, userId: number): Promise<ListMemberResponseDTO[]> {
        const exist = await this.repository.existById(listId)
        if (!exist) {
            throw new NotFoundError("list not found")
        }

        const userRole = await this.repository.findUserRole(userId, listId)
        if (userRole === null) {
            throw new ForbiddenError("access denied, only list members can get list information")
        }

        const listMembers = await this.repository.findMembers(listId)

        return listMembers.map(listMember => ({
            listId: listMember.list_id,
            memberId: listMember.user_id,
            role: listMember.role
        }))
    }

    async updateListMember(dto: UpdateListMemberDTO, userId: number): Promise<ListMemberResponseDTO> {
        const list = await this.repository.findById(dto.listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        if (list.creator_id !== userId) {
            throw new ForbiddenError("access denied, only list owner is allowed to change members' role")
        }

        const memberRole = await this.repository.findUserRole(dto.memberId, dto.listId)
        if (!memberRole) {
            throw new NotFoundError("user is not a member in this list")
        }

        if (memberRole === dto.role) {
            throw new BadRequestError("nothing to update")
        }

        const listMember = await this.repository.updateListMember(dto)

        return {
            listId: listMember.list_id,
            memberId: listMember.user_id,
            role: listMember.role
        }
    }

    async removeListMember(listId: number, memberId: number, userId: number): Promise<void> {
        const list = await this.repository.findById(listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        const memberRole = await this.repository.findUserRole(memberId, listId)
        if (!memberRole) {
            throw new NotFoundError("user is not a member in this list")
        }

        if (list.creator_id !== userId) {
            throw new ForbiddenError("access denied, only list owner is allowed to remove member")
        }

        if (memberRole === Role.OWNER) {
            throw new ForbiddenError("access denied, you can't remove list owner")
        }

        await this.repository.removeMember(memberId, listId)
    }
}