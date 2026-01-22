import { Role } from "../../../../generated/prisma/enums";

export interface ListMemberResponseDTO {
    listId: number,
    memberId: number,
    role: Role
}