export interface AddListItemDTO {
    listId: number,
    itemId: number,
    quantity: number,
    isChecked: boolean
}

export interface UpdateListItemDTO {
    listId: number,
    itemId: number,
    quantity?: number,
    isChecked?: boolean
}

export interface ListItemResponseDTO {
    listId: number,
    itemId: number, 
    quantity: number,
    isChecked: boolean
}