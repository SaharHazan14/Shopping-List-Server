import { ConflictError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateListDTO } from "./dto/create-list.dto";
import { UpdateListDTO } from "./dto/update-list.dto";
import { ListResponseDTO } from "./dto/list-response.dto";
import { ListRepository } from "./list.repository";

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

    /*
    async addListMember(userId: number, listId: number, memberId: number, memberRole: Role) {
        // check both users exist

        const list = await this.repo.findById(listId)

        if (list === null) {
            throw new NotFoundError("List not found")
        }

        const role = await this.repo.findUserRole(userId, listId)
        
        if (!role || role !== Role.OWNER) {
            throw new ForbiddenError("Access denied - only owners can add list members")
        }

        if (memberRole === 'OWNER') {
            throw new BadRequestError("Member can't be owner")
        }

        return this.repo.addMember(memberId, listId, memberRole)
    }

    async getListMembers(userId: number, listId: number) {
        // check user exist

        const list = await this.repo.findById(listId)

        if (list === null) {
            throw new NotFoundError("List not found")
        }

        return this.repo.findMembers(listId)
    }

    async getUserListMemberships(userId: number) {
        // check user exists

        return this.repo.findUserMemberships(userId)
    }

    async updateMemberRole(userId: number, listId: number, memberId: number, memberNewRole: Role) {
        // check both users exists
        
        const list = await this.repo.findById(listId)

        if (list === null) {
            throw new NotFoundError("List not found")
        }

        const userRole = await this.repo.findUserRole(userId, listId)
        
        if (!userRole || userRole !== Role.OWNER) {
            throw new ForbiddenError("Access denied - only owners can update list members role")
        }

        const memberRole = await this.repo.findUserRole(memberId, listId)

        if (!memberRole) {
            throw new BadRequestError("User is not list member")
        }

        if (memberRole === Role.OWNER) {
            throw new ForbiddenError("Can't change owner role")
        }

        if (memberNewRole === Role.OWNER) {
            throw new BadRequestError("Member can't be owner")
        }

        if (memberRole === memberNewRole) {
            throw new BadRequestError("nothing to update")
        }

        return this.repo.updateMemberRole(memberId, listId, memberNewRole)
    }

    async removeMember(userId: number, listId: number, memberId: number) {
        // check both users exist

        const list = await this.repo.findById(listId)

        if (list === null) {
            throw new NotFoundError("List not found")
        }

        const userRole = await this.repo.findUserRole(userId, listId)
        
        if (!userRole || userRole !== Role.OWNER) {
            throw new ForbiddenError("Access denied - only owners can remove list members role")
        }

        const memberRole = await this.repo.findUserRole(memberId, listId)

        if (!memberRole) {
            throw new NotFoundError("Member not found")
        }

        await this.repo.removeMember(memberId, listId)
    }
        */
}