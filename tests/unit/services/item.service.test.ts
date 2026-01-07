/*import { Category } from "../../../generated/prisma/enums"
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../src/errors"
import { ItemRepository } from "../../../src/modules/item/item.repository"
import { ItemService } from "../../../src/modules/item/item.service"

describe("ItemService", () => {
    let repo: Partial<jest.Mocked<ItemRepository>>
    let service: ItemService

    beforeEach(() => {
        repo = {
            findByCreatorAndName: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findGlobals: jest.fn(),
            updateName: jest.fn(),
            delete: jest.fn()
        }

        service = new ItemService(repo as ItemRepository)
    })

    describe("createItem", () => {
        it("throws if name is empty", async () => {
            await expect(
                service.createItem("", Category.OTHER, 1)
            ).rejects.toBeInstanceOf(BadRequestError)
        })

        it("throws if user already has an item with this name", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: 1
            }
            
            repo.findByCreatorAndName?.mockImplementation(
                async (creatorId: number, name: string) => {
                    if (creatorId === 1 && name === 'Milk') {
                        return item
                    }

                    return null
                }
            )

            await expect(
                service.createItem('Milk', Category.DAIRY, 1)
            ).rejects.toBeInstanceOf(BadRequestError)
        })

        it("creates new item successfully", async () => {
            repo.findByCreatorAndName?.mockResolvedValue(null)
            
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: 1
            }

            repo.create?.mockResolvedValue(item)

            const result = await service.createItem('Milk', Category.DAIRY, 1)

            expect(result).toBe(item)
        })
    })

    describe("getItemById", () => {
        it("throws if item not found", async () => {
            repo.findById?.mockResolvedValue(null)

            await expect(
                service.getItemById(1, 1)
            ).rejects.toBeInstanceOf(NotFoundError)
        })

        it("throws if item is neither user's nor global", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: 1
            }

            repo.findById?.mockResolvedValue(item)
            
            await expect(
                service.getItemById(1, 2)
            ).rejects.toBeInstanceOf(ForbiddenError)
        })

        it("retunrs item successfully", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: null
            }

            repo.findById?.mockResolvedValue(item)

            const result = await service.getItemById(1, 2)
            
            expect(result).toBe(item)
        })
    })

    describe("getGlobalItems", () => {
        it("returns all global items", async () => {
            const items = [
                {id: 1, name: 'Milk', category: Category.DAIRY, image: null, creator_id: null},
                {id: 2, name: 'Orange', category: Category.FRUITS, image: null, creator_id: null},
                {id: 3, name: 'Tomato', category: Category.VEGETABLES, image: null, creator_id: null}
            ]

            repo.findGlobals?.mockResolvedValue(items) 

            const result = await service.getGlobalItems()

            expect(result).toBe(items)
        })
    })

    describe("updateItemName", () => {
        it("throws if item not found", async () => {
            repo.findById?.mockResolvedValue(null)

            await expect(
                service.updateItemName(1, 'Milk', 1)
            ).rejects.toBeInstanceOf(NotFoundError)
        })

        it("throws if user is not the creator of the item", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: null
            }

            repo.findById?.mockResolvedValue(item)

            await expect(
                service.updateItemName(1, 'New milk', 1)
            ).rejects.toBeInstanceOf(ForbiddenError)
        })

        it("throws if name is not provided", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: 1
            }

            repo.findById?.mockResolvedValue(item)

            await expect(
                service.updateItemName(1, '', 1)
            ).rejects.toBeInstanceOf(BadRequestError)
        })

        it("throws if user already has an item with this name", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: 1
            }

            repo.findById?.mockResolvedValue(item)
            repo.findByCreatorAndName?.mockResolvedValue(item)

            await expect(
                service.updateItemName(1, 'Milk', 1)
            ).rejects.toBeInstanceOf(BadRequestError)
        })

        it("update item's name successfully", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: 1
            }

            let newItem = item
            newItem.name = 'New milk'

            repo.findById?.mockResolvedValue(item)
            repo.findByCreatorAndName?.mockResolvedValue(null)
            repo.updateName?.mockResolvedValue(newItem)

            const result = await service.updateItemName(1, 'New milk', 1)

            expect(result.name).toBe('New milk')
        })
    })

    describe("deleteItem", () =>{
        it("throws if item not found", async () => {
            repo.findById?.mockResolvedValue(null)

            await expect(
                service.deleteItem(1, 1)
            ).rejects.toBeInstanceOf(NotFoundError)
        })

        it("throws if user is not the creator of the item", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: null
            }

            repo.findById?.mockResolvedValue(item)

            await expect(
                service.deleteItem(1, 1)
            ).rejects.toBeInstanceOf(ForbiddenError)
        })
        
        it("deletes item successfully", async () => {
            const item = {
                id: 1,
                name: 'Milk',
                category: Category.DAIRY,
                image: null,
                creator_id: 1
            }

            repo.findById?.mockResolvedValue(item)

            await service.deleteItem(1,1)

            expect(repo.delete).toHaveBeenCalledWith(1)
        })
    })
})*/