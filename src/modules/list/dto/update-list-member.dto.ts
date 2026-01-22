import { Role } from "../../../../generated/prisma/enums";

export interface UpdateListMemberDTO {
    listId: number,
    memberId: number,
    role: Role
}