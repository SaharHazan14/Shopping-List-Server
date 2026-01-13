import { title } from "process"
import { List } from "../../../generated/prisma/browser"
import { Role } from "../../../generated/prisma/enums"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../../src/errors"
import { CreateListDTO } from "../../../src/modules/list/dto/create-list.dto"
import { ListResponseDTO } from "../../../src/modules/list/dto/list-response.dto"
import { ListRepository } from "../../../src/modules/list/list.repository"
import { ListService } from "../../../src/modules/list/list.service"

describe("ListService", () => {
    let repo: Partial<jest.Mocked<ListRepository>>
    let service: ListService

    beforeEach(() => {
        repo = {
            create: jest.fn(),
            existByTitleAndCreator: jest.fn(),
            findByCreatorAndTitle: jest.fn(),
            findUserRole: jest.fn(),
            findById: jest.fn(),
            findByCreator: jest.fn(),
            findByUser: jest.fn(),
            update:jest.fn(),
            delete: jest.fn()
        }

        service = new ListService(repo as ListRepository)
    })

    describe("createList", () => {
        it("throws if creator already has a list with same title", async () => {
            repo.existByTitleAndCreator?.mockResolvedValue(true)

            await expect(
                service.createList({
                    title: "Groceries",
                    description: null,
                    userId: 1
                })
            ).rejects.toBeInstanceOf(ConflictError)
        })

        it("creates a list when no duplicate exists", async () => {
            repo.existByTitleAndCreator?.mockResolvedValue(false)

            repo.create?.mockResolvedValue({
                id: 1,
                title: "Groceries",
                description: null,
                creator_id: 1,
            })

            const result = await service.createList({
                title: "Groceries",
                description: null,
                userId: 1
            })

            expect(repo.create).toHaveBeenCalledWith({
                title: "Groceries",
                description: null,
                userId: 1
            })

            expect(result.title).toBe("Groceries")
        })
    })
    
    describe("getListById", () => {
        it("throws if list not found", async () => { 
            repo.findById?.mockResolvedValue(null)

            await expect(
                service.getListById(1, 1)
            ).rejects.toBeInstanceOf(NotFoundError)
        })

        it("throws if user is not a member in the list", async () => {
            repo.findById?.mockResolvedValue({
                id: 1,
                title: "Groceries",
                description: null,
                creator_id: 1
            })

            repo.findUserRole?.mockResolvedValue(null)

            await expect(
                service.getListById(1, 1)
            ).rejects.toBeInstanceOf(ForbiddenError)
        })

        it("returns list when it exists and user has access", async () => {
            repo.findById?.mockResolvedValue({
                id: 1,
                title: "Groceries",
                description: null,
                creator_id: 1,
            })

            repo.findUserRole?.mockResolvedValue(Role.OWNER)

            const result = await service.getListById(1, 1)

            expect(
                repo.findById
            ).toHaveBeenCalledWith(1)

            expect(
                result?.id
            ).toBe(1)
        })
    })

    describe("getUserLists", () => {
        const lists = [
                {
                    id: 1,
                    title: "Groceries",
                    description: null,
                    creator_id: 1
                },
                {
                    id: 2,
                    title: "Groceries2",
                    description: null,
                    creator_id: 1
                },
                {
                    id: 3,
                    title: "Groceries3",
                    description: null,
                    creator_id: 2
                }
            ]

        const listsAsRespone: ListResponseDTO[] = lists.map(list => ({
            id: list.id,
            title: list.title,
            description: list.description,
            creatorId: list.creator_id
        }))

        it("returns only created lists when includeMember is false", async () => {
            repo.findByCreator?.mockResolvedValue(lists.slice(0,2))

            const result = await service.getUserLists(1, false)

            expect(repo.findByCreator).toHaveBeenCalledWith(1)
            expect(repo.findByUser).not.toHaveBeenCalled()
            expect(result).toStrictEqual(listsAsRespone.slice(0,2))
        })

        it("returns all user lists when shared is true", async () => {
            repo.findByUser?.mockResolvedValue(lists)

            const result = await service.getUserLists(1, true)

            expect(repo.findByCreator).not.toHaveBeenCalled()
            expect(repo.findByUser).toHaveBeenCalledWith(1)
            expect(result).toStrictEqual(listsAsRespone)
        })
    }) 

    describe("updateListTitle", () => {
        it("throws if list not found", async () => {
            repo.findById?.mockResolvedValue(null)

            await expect(
                service.updateList(1, {listId: 1, title: "New Title"})
            ).rejects.toBeInstanceOf(NotFoundError)
        })

        it("throws if user is not OWNER", async () => {
            repo.findById?.mockResolvedValue({id: 1, title: "List", description: null, creator_id: 1})

            await expect(
                service.updateList(2, {listId: 1, title: "New Title"})
            ).rejects.toBeInstanceOf(ForbiddenError)
        })

        it("throws if user already has a list with the same title", async () => {
            repo.findById?.mockResolvedValue({id: 1, title: "List", description: null, creator_id: 1})
            repo.findByCreatorAndTitle?.mockResolvedValue({id: 2, title: "Groceries", description: null, creator_id: 1})

            await expect(
                service.updateList(1, {listId: 1, title: "Groceries"})
            ).rejects.toBeInstanceOf(ConflictError)
        })

        it("updates list title successfully", async () => {
            const updated: ListResponseDTO = {id: 1, title: "New Title", description: null, creatorId: 1}
            
            repo.findById?.mockResolvedValue({id: 1, title: "List", description: null, creator_id: 1})
            repo.findByCreatorAndTitle?.mockResolvedValue(null)
            repo.update?.mockResolvedValue({id: updated.id, title: updated.title, description: updated.description, creator_id: updated.creatorId})

            const result = await service.updateList(1, {listId: 1, title: "New Title"})

            expect(repo.update).toHaveBeenCalledWith({listId: 1, title: "New Title"})
            expect(result).toStrictEqual(updated)
        })
    })

    describe("deleteList", () => {
        it("throws if list not found", async () => {
            repo.findById?.mockResolvedValue(null)

            await expect(
                service.deleteList(1, 10)
            ).rejects.toBeInstanceOf(NotFoundError)
        })

        it("throws if user is not owner", async () => {
            repo.findById?.mockResolvedValue({id: 10} as any)

            await expect(
                service.deleteList(1, 10)
            ).rejects.toBeInstanceOf(ForbiddenError)

            expect(repo.delete).not.toHaveBeenCalled()
        })

        it("deletes list when user is owner", async () => {
            repo.findById?.mockResolvedValue({id: 10, title: "List", description: null, creator_id: 1})
            repo.delete?.mockResolvedValue(undefined)

            await service.deleteList(1, 10)

            expect(repo.delete).toHaveBeenCalledWith(10)
        })
    })
})