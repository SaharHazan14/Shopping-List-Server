import { Role } from "../../../../generated/prisma/enums";

export interface AddListMemberDTO {
    listId: number,
    memberId: number,
    memberRole: Role
}