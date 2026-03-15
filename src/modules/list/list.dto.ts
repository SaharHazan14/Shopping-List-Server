export interface CreateListDTO {
    title: string,
    description?: string,
    creatorId: number
}

export interface UpdateListDTO {
    id: number,
    title?: string,
    description?: string
}

export interface ListResponseDTO {
    id: number,
    title: string,
    description: string | null,
    creatorId: number
}

export interface ListStatsDTO {
    listId: number,
    title: string,
    description: string | null,
    creatorEmail: string,
    totalItems: number,
    checkedItems: number
}