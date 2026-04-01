import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../errors/index.js";
import { CreateListDTO, UpdateListDTO, ListResponseDTO, ListStatsDTO } from "./list.dto.js";
import { ListRepository } from "./list.repository.js";
import { AddListMemberDTO, UpdateListMemberDTO, ListMemberResponseDTO } from "./user-list/user-list.dto.js";
import { Role } from "@prisma/client"
import { AddListItemDTO, UpdateListItemDTO, ListItemResponseDTO, ListItemWithNameDTO } from "./list-item/list-item.dto.js";
import { ItemRepository } from "../item/item.repository.js";
import { ListItemRepository } from "./list-item/list-Item.repository.js";
import { UserListRepository } from "./user-list/user-list.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { List, ListItem, UserList } from "@prisma/client"
import logger from "../../logger.js";

export class ListService {
    constructor(
        private readonly listRepository: ListRepository,
        private readonly itemRepository: ItemRepository,
        private readonly userListRepository: UserListRepository,
        private readonly listItemRepository: ListItemRepository,
        private readonly userRepository: UserRepository
    ) {}

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

    private async assertUniqueTitleForCreator(title: string, creatorId: number): Promise<void> {
        const exists =  await this.listRepository.existByTitleAndCreator(title, creatorId)
        if (exists) {
            logger.warn("Attempted to create duplicate list title", {
                creatorId,
                title
            });
            throw new ConflictError("A list with this title already exists")
        }
    }

    private async getExistingListOrThrow(listId: number): Promise<List> {
        const list = await this.listRepository.findById(listId) 
        if (!list) {
            logger.warn("Attempted to access non-existing list", { 
                listId 
            })
            throw new NotFoundError("List not found")
        }

        return list
    }

    private async assertListExists(listId: number): Promise<void> {
        const exists = await this.listRepository.existById(listId)
        if (!exists) {
            logger.warn("Attempted to access non-existing list", { 
                listId 
            })
            throw new NotFoundError("List not found")
        }
    }

    private async assertUserRole(userId: number, listId: number, role: Role[]): Promise<void> {
        const userRole = await this.userListRepository.findUserRole(userId, listId)
        if (userRole === null || !role.includes(userRole)) {
            logger.warn("Attempted to access list with insufficient permissions", {
                userId,
                listId,
                requiredRoles: role,
                actualRole: userRole
            });
            throw new ForbiddenError("Access denied")
        }
    }

    private async assertMemberExists(memberId: number, listId: number): Promise<void> {
        const userRole = await this.userListRepository.findUserRole(memberId, listId)
        if (userRole === null) {
            logger.warn("Attempted to manage non-existing member in list", {
                listId,
                memberId
            });
            throw new NotFoundError("Member not found")
        }
    }

    private async assertMemberNotExists(memberId: number, listId: number): Promise<void> {
        const userRole = await this.userListRepository.findUserRole(memberId, listId)
        if (userRole !== null) {
            logger.warn("Attempted to add existing member to list", {
                listId,
                memberId
            });
            throw new ConflictError("Member already has a role")
        }
    }

    private async assertItemExistsInList(itemId: number, listId: number): Promise<void> {
        const exists = await this.listItemRepository.findByListIdAndItemId(listId, itemId)
        if (exists === null) {
            logger.warn("Attempted to manage non-existing item in list", {
                listId,
                itemId
            });
            throw new NotFoundError("Item not found in this list")
        }
    }

    private async assertItemNotExistsInList(itemId: number, listId: number): Promise<void> {
        const exists = await this.listItemRepository.findByListIdAndItemId(listId, itemId)
        if (exists !== null) {
            logger.warn("Attempted to add existing item to list", {
                listId,
                itemId
            });
            throw new ConflictError("Item already exists in this list")
        }
    }

    async createList(dto: CreateListDTO): Promise<ListResponseDTO> {
        logger.debug("createList requested", { title: dto.title, creatorId: dto.creatorId });
        await this.assertUniqueTitleForCreator(dto.title, dto.creatorId)

        const list = await this.listRepository.create(dto)
        logger.info("List created successfully", { 
            listId: list.id,
            creatorId: list.creator_id,
            title: list.title
        })

        return this.toListResponseDTO(list)
    }
    
    async getListById(listId: number, userId: number): Promise<ListResponseDTO> {
        logger.debug("getListById requested", { listId, userId });
        const list = await this.getExistingListOrThrow(listId)
        logger.debug('Validating user role for getListById', { listId, userId })
        await this.assertUserRole(userId, listId, Object.values(Role))
        logger.info("List fetched successfully", { 
            listId, 
            userId 
        })

        return this.toListResponseDTO(list)
    }

    async getUserLists(userId: number, includeMember: boolean): Promise<ListResponseDTO[]> {
        logger.debug('getUserLists requested', { userId, includeMember })
        const lists = includeMember 
            ? await this.listRepository.findByUser(userId) 
            : await this.listRepository.findByCreator(userId)

        logger.info("User lists fetched successfully", { 
            userId, 
            includeMember, 
            count: lists.length 
        })
    
        return lists.map(list => this.toListResponseDTO(list))
    }

    // NOTICE 
    async getUserListsWithStats(userId: number, includeMember: boolean): Promise<ListStatsDTO[]> {
        logger.debug('getUserListsWithStats requested', { userId, includeMember })
        const lists = includeMember 
            ? await this.listRepository.findByUser(userId) 
            : await this.listRepository.findByCreator(userId)

        const listIds = lists.map(list => list.id)
        logger.debug('Lists retrieved for stats', { userId, listIds })

        const stats = await this.listItemRepository.getItemStats(listIds)

        // deduplicate creator ids so we query users only once per creator
        const creatorIds = Array.from(new Set(lists.map(list => list.creator_id)))

        const emails = await this.userRepository.getEmailsByIds(creatorIds)

        const result = lists.map(list => {
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

        logger.debug('getUserListsWithStats completed', { userId, count: result.length })
        return result
    }

    async updateList(userId: number, dto: UpdateListDTO): Promise<ListResponseDTO> {
        logger.debug('updateList requested', { userId, listId: dto.id, title: dto.title })
        const list = await this.getExistingListOrThrow(dto.id)

        await this.assertUserRole(userId, dto.id, [Role.OWNER])
        
        if (dto.title && dto.title !== list.title) {
            logger.debug('updateList detected title change', { listId: dto.id, oldTitle: list.title, newTitle: dto.title })
            await this.assertUniqueTitleForCreator(dto.title, userId)
        }

        const updated = await this.listRepository.update(dto)
        logger.info("List updated successfully", { 
            listId: updated.id, 
            userId,
            updatedFields: Object.keys(dto).filter(key => key !== "id")
        })

        return this.toListResponseDTO(updated)
    }

    async deleteList(userId: number, listId: number): Promise<void> {
        logger.debug('deleteList requested', { userId, listId })
        await this.assertListExists(listId)
        
        await this.assertUserRole(userId, listId, [Role.OWNER])

        await this.listRepository.delete(listId)
        logger.info("List deleted successfully", { 
            listId, 
            userId 
        })
    }

    async addListMember(dto: AddListMemberDTO, userId: number): Promise<ListMemberResponseDTO> {        
        logger.debug('addListMember requested', { listId: dto.listId, memberId: dto.memberId, by: userId })
        await this.assertListExists(dto.listId)

        await this.assertUserRole(userId, dto.listId, [Role.OWNER])

        await this.assertMemberNotExists(dto.memberId, dto.listId)

        const listMember = await this.userListRepository.create(dto)
        logger.info("List member added successfully", { 
            listId: dto.listId, 
            userId,
            memberId: listMember.user_id 
        })
        
        return this.toListMemberResponseDTO(listMember)
    }

    // NOTICE
    //async getListMembers(listId: number, userId: number): Promise<ListMemberResponseDTO[]> {
    async getListMembers(listId: number, userId: number) {
        logger.debug('getListMembers requested', { listId, userId })
        await this.assertListExists(listId)

        await this.assertUserRole(userId, listId, Object.values(Role))

        //const listMembers = await this.userListRepository.findByListId(listId)
        const listMembers = await this.userListRepository.findListMembersByListId(listId)
        logger.info("List members fetched successfully", { 
            listId, 
            userId, 
            count: listMembers.length 
        })

        //return listMembers.map(listMember => this.toListMemberResponseDTO(listMember))
        return listMembers
    }

    async updateListMember(dto: UpdateListMemberDTO, userId: number): Promise<ListMemberResponseDTO> {
        logger.debug('updateListMember requested', { listId: dto.listId, memberId: dto.memberId, by: userId, role: dto.role })
        await this.assertListExists(dto.listId)

        await this.assertUserRole(userId, dto.listId, [Role.OWNER])

        await this.assertMemberExists(dto.memberId, dto.listId)

        const listMember = await this.userListRepository.update(dto)
        logger.info("List member updated successfully", { 
            listId: dto.listId, 
            userId,
            memberId: dto.memberId
        })

        return this.toListMemberResponseDTO(listMember)
    }

    async removeListMember(listId: number, memberId: number, userId: number): Promise<void> {
        logger.debug('removeListMember requested', { listId, memberId, by: userId })
        await this.assertListExists(listId)

        await this.assertUserRole(userId, listId, [Role.OWNER])

        await this.assertMemberExists(memberId, listId)

        await this.userListRepository.delete(memberId, listId)
        logger.info("List member removed successfully", { 
            listId, 
            userId,
            memberId
        })
    }

    async addListItem(dto: AddListItemDTO, userId: number): Promise<ListItemResponseDTO> {
        logger.debug('addListItem requested', { listId: dto.listId, itemId: dto.itemId, by: userId })
        await this.assertListExists(dto.listId)

        await this.assertUserRole(userId, dto.listId, [Role.OWNER, Role.EDITOR])

        const item = await this.itemRepository.findById(dto.itemId)
        if (!item) {
            //logger.warn('Attempt to add non-existing item to list', { itemId: dto.itemId })
            throw new NotFoundError("item not found")
        }

        if (item.creator_id !== null && item.creator_id !== userId) {
            //logger.warn('User tried to add item they do not own', { itemId: dto.itemId, userId })
            throw new ForbiddenError("access denied")
        }

        await this.assertItemNotExistsInList(dto.itemId, dto.listId)

        const listItem = await this.listItemRepository.craete(dto)
        logger.info("List item added successfully", { 
            listId: dto.listId, 
            itemId: dto.itemId,
            userId
        })
        
        return this.toListItemResponseDTO(listItem)
    }

    async getListItems(listId: number, userId: number): Promise<ListItemWithNameDTO[]> {
        logger.debug('getListItems requested', { listId, userId })
        await this.assertListExists(listId)

        await this.assertUserRole(userId, listId, Object.values(Role))

        const listItems = await this.listItemRepository.getItemsByListId(listId)
        logger.info("List items fetched successfully", { 
            listId, 
            userId, 
            count: listItems.length 
        })

        return listItems.map((listItem: ListItem & { item: { name: string } }) => {
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
        logger.debug('updateListItem requested', { listId: dto.listId, itemId: dto.itemId, by: userId })
        await this.assertListExists(dto.listId)

        await this.assertUserRole(userId, dto.listId, [Role.OWNER, Role.EDITOR])

        await this.assertItemExistsInList(dto.itemId, dto.listId)

        const updated = await this.listItemRepository.update(dto)
        logger.info("List item updated successfully", { 
            listId: dto.listId, 
            itemId: dto.itemId,
            userId,
            updatedFields: Object.keys(dto).filter(key => !["listId", "itemId"].includes(key))
        })

        return this.toListItemResponseDTO(updated)
    }

    async removeListItem(listId: number, itemId: number, userId: number): Promise<void> {
        logger.debug('removeListItem requested', { listId, itemId, by: userId })
        await this.assertListExists(listId)

        await this.assertUserRole(userId, listId, [Role.OWNER, Role.EDITOR])

        await this.assertItemExistsInList(itemId, listId)

        await this.listItemRepository.delete(listId, itemId)
        logger.info("List item removed successfully", { 
            listId, 
            itemId,
            userId
        })
    }
}