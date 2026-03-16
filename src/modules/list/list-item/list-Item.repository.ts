import { ListItem } from "../../../../generated/prisma/client";
import { prisma } from "../../../../prisma/prisma"; 
import { AddListItemDTO, UpdateListItemDTO } from "./list-item.dto"
import logger from "../../../logger"

export class ListItemRepository {
    async craete(dto: AddListItemDTO): Promise<ListItem> {
        logger.debug('Creating list item in DB', { listId: dto.listId, itemId: dto.itemId })
        const created = await prisma.listItem.create({
            data: {
                list_id: dto.listId,
                item_id: dto.itemId,
                quantity: dto.quantity,
                is_checked: dto.isChecked
            }
        })
        logger.info('List item created', { listId: created.list_id, itemId: created.item_id })
        return created
    }

    async findByListIdAndItemId(listId: number, itemId: number): Promise<ListItem | null> {
        logger.debug('Finding list-item by list and item id', { listId, itemId })
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
        logger.debug('Fetching list items for list', { listId })
        return prisma.listItem.findMany({
            where: {
                list_id: listId
            }
        })
    }

    // New
    async getItemsByListId(listId: number) {
        logger.debug('Getting list items with item names', { listId })
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
        logger.debug('Computing item stats for lists', { listIds })
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
        logger.debug('Updating list-item in DB', { listId: dto.listId, itemId: dto.itemId })
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
        logger.info('List-item updated', { listId: updated.list_id, itemId: updated.item_id })
        return updated
    }

    async delete(listId: number, itemId: number): Promise<void> {
        logger.debug('Deleting list-item from DB', { listId, itemId })
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