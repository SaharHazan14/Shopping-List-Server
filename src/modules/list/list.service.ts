import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateListDTO } from "./dto/create-list.dto";
import { UpdateListDTO } from "./dto/update-list.dto";
import { ListResponseDTO } from "./dto/list-response.dto";
import { ListRepository } from "./list.repository";
import { AddListMemberDTO } from "./dto/add-list-member.dto";
import { Role } from "../../../generated/prisma/enums";
import { ListMemberResponseDTO } from "./dto/list-member-response.dto";
import { UpdateListMemberDTO } from "./dto/update-list-member.dto";
import { AddListItemDTO } from "./dto/add-list-item.dto";
import { ListItemResponseDTO } from "./dto/list-item-response.dto";
import { ItemRepository } from "../item/item.repository";
import { ListItemRepository } from "./list-Item.repository";
import { UserListRepository } from "./user-list.repository";
import { UpdateListItemDTO } from "./dto/update-list-item.dto";

export class ListService {
    constructor(
        private readonly listRepository: ListRepository,
        private readonly itemRepository: ItemRepository,
        private readonly userListRepository: UserListRepository,
        private readonly listItemRepository: ListItemRepository
    ) {}

    async createList(dto: CreateListDTO): Promise<ListResponseDTO> {
        const exist =  await this.listRepository.existByTitleAndCreator(dto.title, dto.userId)
        if (exist) {
            throw new ConflictError("you already have a list with this title")
        }

        const list = await this.listRepository.create(dto)
        return {
            id: list.id,
            title: list.title,
            description: list.description,
            creatorId: list.creator_id
        }
    }
    
    async getListById(listId: number, userId: number): Promise<ListResponseDTO> {
        const list = await this.listRepository.findById(listId) 
        if (!list) {
            throw new NotFoundError("list not found")
        }

        const userRole = await this.listRepository.findUserRole(userId, listId)
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
            ? await this.listRepository.findByUser(userId) 
            : await this.listRepository.findByCreator(userId)

        return lists.map(list => ({
            id: list.id,
            title: list.title,
            description: list.description,
            creatorId: list.creator_id
        }))
    }

    async updateList(userId: number, dto: UpdateListDTO): Promise<ListResponseDTO> {
        const list = await this.listRepository.findById(dto.listId) 
        if (!list) {
            throw new NotFoundError("list not found")
        }

        if (list.creator_id !== userId) {
            throw new ForbiddenError("access denied, you are not allowed to update this list")
        }

        if (dto.title && dto.title !== list.title) {
            const exist = await this.listRepository.findByCreatorAndTitle(userId, dto.title)
            if (exist) {
                throw new ConflictError("you already have a list with this title")
            }
        }

        const updated = await this.listRepository.update(dto)

        return {
            id: updated.id,
            title: updated.title,
            description: updated.description,
            creatorId: updated.creator_id
        }
    }

    async deleteList(userId: number, listId: number): Promise<void> {
        const list = await this.listRepository.findById(listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        if (list.creator_id !== userId) {
            throw new ForbiddenError("access denied, you are not allowed to delete this list")
        }

        await this.listRepository.delete(listId)
    }

    // User - List

    async addListMember(dto: AddListMemberDTO, userId: number): Promise<ListMemberResponseDTO> {        
        const exist = await this.listRepository.existById(dto.listId)
        if (!exist) {
            throw new NotFoundError("list not found")
        }

        const userRole = await this.listRepository.findUserRole(userId, dto.listId)
        if (userRole != Role.OWNER) {
            throw new ForbiddenError("access denied, only owners allowed to add members")
        }

        const memberRole = await this.listRepository.findUserRole(dto.memberId, dto.listId)
        if (memberRole !== null) {
            throw new ConflictError("member already has a role")
        }

        const listMember = await this.userListRepository.create(dto)

        return {
            listId: listMember.list_id,
            memberId: listMember.user_id,
            role: listMember.role
        }
    }

    async getListMembers(listId: number, userId: number): Promise<ListMemberResponseDTO[]> {
        const exist = await this.listRepository.existById(listId)
        if (!exist) {
            throw new NotFoundError("list not found")
        }

        const userRole = await this.listRepository.findUserRole(userId, listId)
        if (userRole === null) {
            throw new ForbiddenError("access denied, only list members can get list information")
        }

        const listMembers = await this.userListRepository.findByListId(listId)

        return listMembers.map(listMember => ({
            listId: listMember.list_id,
            memberId: listMember.user_id,
            role: listMember.role
        }))
    }

    async updateListMember(dto: UpdateListMemberDTO, userId: number): Promise<ListMemberResponseDTO> {
        const list = await this.listRepository.findById(dto.listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        if (list.creator_id !== userId) {
            throw new ForbiddenError("access denied, only list owner is allowed to change members' role")
        }

        const memberRole = await this.listRepository.findUserRole(dto.memberId, dto.listId)
        if (!memberRole) {
            throw new NotFoundError("user is not a member in this list")
        }

        if (memberRole === dto.role) {
            throw new BadRequestError("nothing to update")
        }

        const listMember = await this.userListRepository.update(dto)

        return {
            listId: listMember.list_id,
            memberId: listMember.user_id,
            role: listMember.role
        }
    }

    async removeListMember(listId: number, memberId: number, userId: number): Promise<void> {
        const list = await this.listRepository.findById(listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        const memberRole = await this.listRepository.findUserRole(memberId, listId)
        if (!memberRole) {
            throw new NotFoundError("user is not a member in this list")
        }

        if (list.creator_id !== userId) {
            throw new ForbiddenError("access denied, only list owner is allowed to remove member")
        }

        if (memberRole === Role.OWNER) {
            throw new ForbiddenError("access denied, you can't remove list owner")
        }

        await this.userListRepository.delete(memberId, listId)
    }

    // List - Item

    async addListItem(dto: AddListItemDTO, userId: number): Promise<ListItemResponseDTO> {
        const list = await this.listRepository.findById(dto.listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        const role = await this.userListRepository.findUserRole(userId, dto.listId)
        if (role !== Role.OWNER && role !== Role.EDITOR) {
            throw new ForbiddenError("access denied, only list owner/editor is allowed to add items")
        }

        const item = await this.itemRepository.findById(dto.itemId)
        if (!item) {
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== null && item.creator_id !== userId) {
            throw new ForbiddenError("access denied")
        }

        const exist = await this.listItemRepository.findByListIdAndItemId(dto.listId, dto.itemId)
        if (exist !== null) {
            throw new ConflictError("item already exists in list")
        }

        const listItem = await this.listItemRepository.craete(dto)

        return {
            listId: listItem.list_id,
            itemId: listItem.item_id,
            quantity: listItem.quantity,
            isChecked: listItem.is_checked
        }
    }

    async getListItems(listId: number, userId: number): Promise<ListItemResponseDTO[]> {
        const list = await this.listRepository.findById(listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        const role = await this.userListRepository.findUserRole(userId, listId)
        if (role === null) {
            throw new ForbiddenError("access denied, you are not a list member")
        }

        const listItems = await this.listItemRepository.findByListId(listId)

        return listItems.map(listItem => ({
            listId: listItem.list_id,
            itemId: listItem.item_id,
            quantity: listItem.quantity,
            isChecked: listItem.is_checked
        }))
    }

    async updateListItem(dto: UpdateListItemDTO, userId: number): Promise<ListItemResponseDTO> {
        const list = await this.listRepository.findById(dto.listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        const role = await this.userListRepository.findUserRole(userId, dto.listId)
        if (role !== Role.OWNER && role !== Role.EDITOR) {
            throw new ForbiddenError("access denied, only list owner/editor is allowed to update items")
        }

        const exist = await this.listItemRepository.findByListIdAndItemId(dto.listId, dto.itemId)
        if (exist === null) {
            throw new NotFoundError("item not found in this list")
        }

        const updated = await this.listItemRepository.update(dto)

        return {
            listId: updated.list_id,
            itemId: updated.item_id,
            quantity: updated.quantity,
            isChecked: updated.is_checked
        }
    }

    async removeListItem(listId: number, itemId: number, userId: number): Promise<void> {
        const list = await this.listRepository.findById(listId)
        if (!list) {
            throw new NotFoundError("list not found")
        }

        const role = await this.userListRepository.findUserRole(userId, listId)
        if (role !== Role.OWNER && role !== Role.EDITOR) {
            throw new ForbiddenError("access denied, only list owner/editor is allowed to remove items")
        }

        const exist = await this.listItemRepository.findByListIdAndItemId(listId, itemId)
        if (exist === null) {
            throw new NotFoundError("item not found in this list")
        }

        await this.listItemRepository.delete(listId, itemId)
    }
}