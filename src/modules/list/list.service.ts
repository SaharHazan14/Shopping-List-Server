import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateListDTO, UpdateListDTO, ListResponseDTO, ListStatsDTO } from "./list.dto";
import { ListRepository } from "./list.repository";
import { AddListMemberDTO, UpdateListMemberDTO, ListMemberResponseDTO } from "./user-list/user-list.dto";
import { Role } from "../../../generated/prisma/enums";
import { AddListItemDTO, UpdateListItemDTO, ListItemResponseDTO, ListItemWithNameDTO } from "./list-item/list-item.dto";
import { ItemRepository } from "../item/item.repository";
import { ListItemRepository } from "./list-item/list-Item.repository";
import { UserListRepository } from "./user-list/user-list.repository";
import { UserRepository } from "../user/user.repository";
import { List, ListItem, UserList } from "../../../generated/prisma/client";
import logger from "../../logger";

export class ListService {
    constructor(
        private readonly listRepository: ListRepository,
        private readonly itemRepository: ItemRepository,
        private readonly userListRepository: UserListRepository,
        private readonly listItemRepository: ListItemRepository,
        private readonly userRepository: UserRepository
    ) {}

    // Mappers

    private toListResponseDTO(list: List): ListResponseDTO {
        return {
            id: list.id,
            title: list.title,
            description: list.description,
            creatorId: list.creator_id
        }
    }

    private toListMemberResponseDTO(listMember: UserList): ListMemberResponseDTO {
        return {
            listId: listMember.list_id,
            memberId: listMember.user_id,
            role: listMember.role
        }
    }

    private toListItemResponseDTO(listItem: ListItem): ListItemResponseDTO {
        return { 
            listId: listItem.list_id,
            itemId: listItem.item_id,
            quantity: listItem.quantity,
            isChecked: listItem.is_checked
        }
    }

    // Help functions

    private async assertUniqueTitleForCreator(title: string, creatorId: number): Promise<void> {
        const exists =  await this.listRepository.existByTitleAndCreator(title, creatorId)
        if (exists) {
            throw new ConflictError("A list with this title already exists")
        }
    }

    private async getExistingListOrThrow(listId: number): Promise<List> {
        const list = await this.listRepository.findById(listId) 
        if (!list) {
            throw new NotFoundError("List not found")
        }

        return list
    }

    private async assertListExists(listId: number): Promise<void> {
        const exists = await this.listRepository.existById(listId)
        if (!exists) {
            throw new NotFoundError("List not found")
        }
    }

    private async assertUserRole(userId: number, listId: number, role: Role[]): Promise<void> {
        const userRole = await this.userListRepository.findUserRole(userId, listId)
        if (userRole === null || !role.includes(userRole)) {
            throw new ForbiddenError("Access denied")
        }
    }

    private async assertMemberExists(memberId: number, listId: number): Promise<void> {
        const userRole = await this.userListRepository.findUserRole(memberId, listId)
        if (userRole === null) {
            throw new NotFoundError("Member not found")
        }
    }

    private async assertMemberNotExists(memberId: number, listId: number): Promise<void> {
        const userRole = await this.userListRepository.findUserRole(memberId, listId)
        if (userRole !== null) {
            throw new ConflictError("Member already has a role")
        }
    }

    private async assertItemExistsInList(itemId: number, listId: number): Promise<void> {
        const exists = await this.listItemRepository.findByListIdAndItemId(listId, itemId)
        if (exists === null) {
            throw new NotFoundError("Item not found in this list")
        }
    }

    private async assertItemNotExistsInList(itemId: number, listId: number): Promise<void> {
        const exists = await this.listItemRepository.findByListIdAndItemId(listId, itemId)
        if (exists !== null) {
            throw new ConflictError("Item already exists in this list")
        }
    }

    // Services 

    async createList(dto: CreateListDTO): Promise<ListResponseDTO> {
        logger.info('Creating list in service', { title: dto.title, creatorId: dto.creatorId })
        await this.assertUniqueTitleForCreator(dto.title, dto.creatorId)

        const list = await this.listRepository.create(dto)
        logger.info('List created', { listId: list.id })
        return this.toListResponseDTO(list)
    }
    
    async getListById(listId: number, userId: number): Promise<ListResponseDTO> {
        const list = await this.getExistingListOrThrow(listId)

        await this.assertUserRole(userId, listId, Object.values(Role))

        return this.toListResponseDTO(list)
    }

    async getUserLists(userId: number, includeMember: boolean): Promise<ListResponseDTO[]> {
        const lists = includeMember 
            ? await this.listRepository.findByUser(userId) 
            : await this.listRepository.findByCreator(userId)

        return lists.map(list => this.toListResponseDTO(list))
    }

    async getUserListsWithStats(userId: number, includeMember: boolean): Promise<ListStatsDTO[]> {
        const lists = includeMember 
            ? await this.listRepository.findByUser(userId) 
            : await this.listRepository.findByCreator(userId)

        const listIds = lists.map(list => list.id)

        const stats = await this.listItemRepository.getItemStats(listIds)

        // deduplicate creator ids so we query users only once per creator
        const creatorIds = Array.from(new Set(lists.map(list => list.creator_id)))

        const emails = await this.userRepository.getEmailsByIds(creatorIds)

        return lists.map(list => {
            const stat = stats.get(list.id)

            return {
                listId: list.id,
                title: list.title,
                description: list.description,
                creatorEmail: emails.get(list.creator_id) || "unknown",
                totalItems: stat ? stat.totalItems : 0,
                checkedItems: stat ? stat.checkedItems : 0
            }
        })
    }

    async updateList(userId: number, dto: UpdateListDTO): Promise<ListResponseDTO> {
        const list = await this.getExistingListOrThrow(dto.id)

        await this.assertUserRole(userId, dto.id, [Role.OWNER])
        
        if (dto.title && dto.title !== list.title) {
            await this.assertUniqueTitleForCreator(dto.title, userId)
        }

        const updated = await this.listRepository.update(dto)

        return this.toListResponseDTO(updated)
    }

    async deleteList(userId: number, listId: number): Promise<void> {
        await this.assertListExists(listId)
        
        await this.assertUserRole(userId, listId, [Role.OWNER])

        await this.listRepository.delete(listId)
    }

    async addListMember(dto: AddListMemberDTO, userId: number): Promise<ListMemberResponseDTO> {        
        logger.info('Adding member to list in service', { listId: dto.listId, memberId: dto.memberId, by: userId })
        await this.assertListExists(dto.listId)

        await this.assertUserRole(userId, dto.listId, [Role.OWNER])

        await this.assertMemberNotExists(dto.memberId, dto.listId)

        const listMember = await this.userListRepository.create(dto)

        logger.info('List member added', { listId: dto.listId, memberId: listMember.user_id })
        return this.toListMemberResponseDTO(listMember)
    }

    //async getListMembers(listId: number, userId: number): Promise<ListMemberResponseDTO[]> {
    async getListMembers(listId: number, userId: number) {
        await this.assertListExists(listId)

        await this.assertUserRole(userId, listId, Object.values(Role))

        //const listMembers = await this.userListRepository.findByListId(listId)
        const listMembers = await this.userListRepository.findListMembersByListId(listId)

        //return listMembers.map(listMember => this.toListMemberResponseDTO(listMember))
        return listMembers
    }

    async updateListMember(dto: UpdateListMemberDTO, userId: number): Promise<ListMemberResponseDTO> {
        await this.assertListExists(dto.listId)

        await this.assertUserRole(userId, dto.listId, [Role.OWNER])

        await this.assertMemberExists(dto.memberId, dto.listId)

        const listMember = await this.userListRepository.update(dto)

        return this.toListMemberResponseDTO(listMember)
    }

    async removeListMember(listId: number, memberId: number, userId: number): Promise<void> {
        await this.assertListExists(listId)

        await this.assertUserRole(userId, listId, [Role.OWNER])

        await this.assertMemberExists(memberId, listId)

        await this.userListRepository.delete(memberId, listId)
    }

    async addListItem(dto: AddListItemDTO, userId: number): Promise<ListItemResponseDTO> {
        logger.info('Adding item to list in service', { listId: dto.listId, itemId: dto.itemId, by: userId })
        await this.assertListExists(dto.listId)

        await this.assertUserRole(userId, dto.listId, [Role.OWNER, Role.EDITOR])

        const item = await this.itemRepository.findById(dto.itemId)
        if (!item) {
            logger.warn('Attempt to add non-existing item to list', { itemId: dto.itemId })
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== null && item.creator_id !== userId) {
            logger.warn('User tried to add item they do not own', { itemId: dto.itemId, userId })
            throw new ForbiddenError("access denied")
        }

        await this.assertItemNotExistsInList(dto.itemId, dto.listId)

        const listItem = await this.listItemRepository.craete(dto)
        logger.info('List item added', { listId: dto.listId, itemId: dto.itemId })
        return this.toListItemResponseDTO(listItem)
    }

    async getListItems(listId: number, userId: number): Promise<ListItemWithNameDTO[]> {
        await this.assertListExists(listId)

        await this.assertUserRole(userId, listId, Object.values(Role))

        const listItems = await this.listItemRepository.getItemsByListId(listId)

        return listItems.map(listItem => {
            return {
                listId: listItem.list_id,
                itemId: listItem.item_id,
                itemName: listItem.item.name,
                quantity: listItem.quantity,
                isChecked: listItem.is_checked,
            }
        })
    }

    async updateListItem(dto: UpdateListItemDTO, userId: number): Promise<ListItemResponseDTO> {
        await this.assertListExists(dto.listId)

        await this.assertUserRole(userId, dto.listId, [Role.OWNER, Role.EDITOR])

        await this.assertItemExistsInList(dto.itemId, dto.listId)

        const updated = await this.listItemRepository.update(dto)

        return this.toListItemResponseDTO(updated)
    }

    async removeListItem(listId: number, itemId: number, userId: number): Promise<void> {
        await this.assertListExists(listId)

        await this.assertUserRole(userId, listId, [Role.OWNER, Role.EDITOR])

        await this.assertItemExistsInList(itemId, listId)

        await this.listItemRepository.delete(listId, itemId)
    }
}