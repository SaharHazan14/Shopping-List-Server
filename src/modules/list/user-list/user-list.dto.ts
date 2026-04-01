import { Role } from "../../../generated/prisma/enums";

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