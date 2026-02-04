import { ListItem } from "../../../generated/prisma/client";
import { prisma } from "../../../prisma/prisma";
import { AddListItemDTO } from "./dto/add-list-item.dto";
import { UpdateListItemDTO } from "./dto/update-list-item.dto";

export class ListItemRepository {
    async craete(dto: AddListItemDTO): Promise<ListItem> {
        return prisma.listItem.create({
            data: {
                list_id: dto.listId,
                item_id: dto.itemId,
                quantity: dto.quantity,
                is_checked: dto.isChecked
            }
        })
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

    async update(dto: UpdateListItemDTO): Promise<ListItem> {
        return prisma.listItem.update({
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