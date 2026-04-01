import { Role } from "@prisma/client"

export interface AddListMemberDTO {
    listId: number,
    memberId: number,
    role: Role
}

export interface UpdateListMemberDTO {
    listId: number, 
    memberId: number,
    role: Role
}

export interface ListMemberResponseDTO {
    listId: number,
    memberId: number, 
    role: Role
}