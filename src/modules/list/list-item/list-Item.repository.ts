import { ListItem } from "@prisma/client"
import { prisma } from "../../../prisma.js"; 
import { AddListItemDTO, UpdateListItemDTO } from "./list-item.dto.js"

export class ListItemRepository {
    async craete(dto: AddListItemDTO): Promise<ListItem> {
        const created = await prisma.listItem.create({
            data: {
                list_id: dto.listId,
                item_id: dto.itemId,
                quantity: dto.quantity,
                is_checked: dto.isChecked
            }
        })
        return created
    }

    async findByListIdAndItemId(listId: number, itemId: number): Promise<ListItem | null> {
        return prisma.listItem.findUnique({
            where: {
                list_id_item_id: {
                    list_id: listId,
                    item_id: itemId
                }
            }
        })
    }

    async findByListId(listId: number): Promise<ListItem[]> {
        return prisma.listItem.findMany({
            where: {
                list_id: listId
            }
        })
    }

    // New
    async getItemsByListId(listId: number) {
        return prisma.listItem.findMany({
            where: { list_id: listId },
            include: {
                item: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    async getItemStats(listIds: number[]) {
        const items = await prisma.listItem.findMany({
            where: {
                list_id: {
                    in: listIds
                }
            }, 
            select: {
                list_id: true,
                is_checked: true
            }
        })

        const stats = new Map<number, { totalItems: number; checkedItems: number }>();

        for (const item of items) {
            if (!stats.has(item.list_id)) {
                stats.set(item.list_id, { totalItems: 0, checkedItems: 0 });
            }

            const entry = stats.get(item.list_id)!;
            
            entry.totalItems++;
            
            if (item.is_checked) {
                entry.checkedItems++;
            }
        }

        return stats;
    }

    async update(dto: UpdateListItemDTO): Promise<ListItem> {
        const updated = await prisma.listItem.update({
            where: {
                list_id_item_id: {
                    list_id: dto.listId,
                    item_id: dto.itemId
                }
            },
            data: {
                quantity: dto.quantity,
                is_checked: dto.isChecked
            }
        })
        return updated
    }

    async delete(listId: number, itemId: number): Promise<void> {
        await prisma.listItem.delete({
            where: {
                list_id_item_id: {
                    list_id: listId,
                    item_id: itemId
                }
            }
        })
    }
}