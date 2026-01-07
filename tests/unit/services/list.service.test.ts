/*import { Role } from "../../../generated/prisma/enums"
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../src/errors"
import { ListRepository } from "../../../src/modules/list/list.repository"
import { ListService } from "../../../src/modules/list/list.service"

describe("ListService", () => {
    let repo: Partial<jest.Mocked<ListRepository>>
    let service: ListService

    beforeEach(() => {
        repo = {
            create: jest.fn(),
            findByCreatorAndTitle: jest.fn(),
            findUserRole: jest.fn(),
            findById: jest.fn(),
            findByCreator: jest.fn(),
            findByUser: jest.fn(),
            updateName:jest.fn(),
            delete: jest.fn()
        }

        service = new ListService(repo as ListRepository)
    })

    describe("createList", () => {
        it("throws if title is empty", async () => {
            await expect(
                service.createList(1, "")
            ).rejects.toBeInstanceOf(BadRequestError)
        })

        it("throws if creator already has a list with same title", async () => {
            repo.findByCreatorAndTitle?.mockResolvedValue({id: 1} as any)

            await expect(
                service.createList(1, "Groceries")
            ).rejects.toThrow("You already have a list with this title")
        })

        it("creates a list when no duplicate exists", async () => {
            repo.findByCreatorAndTitle?.mockResolvedValue(null)

            repo.create?.mockResolvedValue({
                id: 1,
                title: "Groceries",
                description: null,
                creator_id: 1,
            }as any)

            const result = await service.createList(1, "Groceries")

            expect(repo.create).toHaveBeenCalledWith(
                "Groceries",
                null, 
                1
            )

            expect(result.title).toBe("Groceries")
        })
    })

    describe("getListById", () => {
        it("throws if user is not a member in the list", async () => {
            repo.findUserRole?.mockResolvedValue(null)

            await expect(
                service.getListById(1, 1)
            ).rejects.toBeInstanceOf(ForbiddenError)

            expect(
                repo.findById
            ).not.toHaveBeenCalled()
        })

        it("throws if list not found", async () => {
            repo.findUserRole?.mockResolvedValue(Role.OWNER)
            
            repo.findById?.mockResolvedValue(null)

            await expect(
                service.getListById(1, 1)
            ).rejects.toBeInstanceOf(NotFoundError)
        })

        it("returns list when it exists and user has access", async () => {
            repo.findUserRole?.mockResolvedValue(Role.OWNER)
            
            repo.findById?.mockResolvedValue({
                id: 1,
                title: "Groceries",
                description: null,
                creator_id: 1,
            } as any)

            const result = await service.getListById(1, 2)

            expect(
                repo.findById
            ).toHaveBeenCalledWith(1)

            expect(
                result?.id
            ).toBe(1)
        })
    })

    describe("getUserLists", () => {
        it("returns only created lists when shared is false", async () => {
            const lists = [{id: 1}, {id: 2}]

            repo.findByCreator?.mockResolvedValue(lists as any)

            const result = await service.getUserLists(1, false)

            expect(repo.findByCreator).toHaveBeenCalledWith(1)
            expect(repo.findByUser).not.toHaveBeenCalled()
            expect(result).toBe(lists)
        })

        it("returns all user lists when shared is true", async () => {
            const lists = [{id: 1}, {id: 2}, {id: 3}]

            repo.findByUser?.mockResolvedValue(lists as any)

            const result = await service.getUserLists(1, true)

            expect(repo.findByCreator).not.toHaveBeenCalled()
            expect(repo.findByUser).toHaveBeenCalledWith(1)
            expect(result).toBe(lists)
        })

        it("returns all user lists when shared is default", async () => {
            const lists = [{id: 1}, {id: 2}, {id: 3}]

            repo.findByUser?.mockResolvedValue(lists as any)

            const result = await service.getUserLists(1)

            expect(repo.findByCreator).not.toHaveBeenCalled()
            expect(repo.findByUser).toHaveBeenCalledWith(1)
            expect(result).toBe(lists)
        })
    })

    describe("updateListTitle", () => {
        it("throws if list not found", async () => {
            repo.findById?.mockResolvedValue(null)

            await expect(
                service.updateListTitle(1, 1, "New Title")
            ).rejects.toBeInstanceOf(NotFoundError)
        })

        it("throws if user is not OWNER", async () => {
            repo.findById?.mockResolvedValue({id: 1} as any)
            repo.findUserRole?.mockResolvedValue(Role.EDITOR)

            await expect(
                service.updateListTitle(1, 10, "New title")
            ).rejects.toBeInstanceOf(ForbiddenError)
        })

        it("throws if title is empty", async () => {
            repo.findById?.mockResolvedValue({id : 1} as any)
            repo.findUserRole?.mockResolvedValue(Role.OWNER)

            await expect(
                service.updateListTitle(1, 10, "")
            ).rejects.toBeInstanceOf(BadRequestError)
        })

        it("throws if user already has a list with the same title", async () => {
            repo.findById?.mockResolvedValue({ id: 1 } as any)
            repo.findUserRole?.mockResolvedValue(Role.OWNER)
            repo.findByCreatorAndTitle?.mockResolvedValue({ id: 2 } as any)

            await expect(
                service.updateListTitle(1, 1, "Groceries")
            ).rejects.toBeInstanceOf(BadRequestError)
        })

        it("updates list title successfully", async () => {
            const updated = {id: 1, title: "New Title", creator_id: 1}
            
            repo.findById?.mockResolvedValue({ id: 1 } as any)
            repo.findUserRole?.mockResolvedValue(Role.OWNER)
            repo.findByCreatorAndTitle?.mockResolvedValue(null)
            repo.updateName?.mockResolvedValue(updated as any)

            const result = await service.updateListTitle(1, 1, "New Title")

            expect(repo.updateName).toHaveBeenCalledWith(1, "New Title")
            expect(result).toBe(updated)
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
            repo.findUserRole?.mockResolvedValue(Role.EDITOR)

            await expect(
                service.deleteList(1, 10)
            ).rejects.toBeInstanceOf(ForbiddenError)

            expect(repo.delete).not.toHaveBeenCalled()
        })

        it("deletes list when user is owner", async () => {
            repo.findById?.mockResolvedValue({id: 10} as any)
            repo.findUserRole?.mockResolvedValue(Role.OWNER)
            repo.delete?.mockResolvedValue(undefined)

            await service.deleteList(1, 10)

            expect(repo.delete).toHaveBeenCalledWith(10)
        })
    })
})*/