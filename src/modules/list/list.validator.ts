import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../errors";
import { CreateListSchema } from "./schemas/create-list.schema";
import { GetListByIdSchema } from "./schemas/get-list-by-id.schema";
import { GetUserListsSchema } from "./schemas/get-user-lists.schema";
import { UpdateListSchema } from "./schemas/update-list.schema";
import { DeleteListSchema } from "./schemas/delete-list.schema";

export function validateCreateList(req: Request, res: Response, next: NextFunction) {
    const result = CreateListSchema.safeParse(req.body)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    req.body.title = result.data.title
    req.body.description = result.data.description

    next()
}

export function validateGetListById(req: Request, res: Response, next: NextFunction) {
    const result = GetListByIdSchema.safeParse(req.params)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    next()
}

export function validateGetUserLists(req: Request, res: Response, next: NextFunction) {
    const result = GetUserListsSchema.safeParse(req.query)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    req.query.includeMember = String(result.data.includeMember)

    next()
}

export function validateUpdateList(req: Request, res: Response, next: NextFunction) {
    const reqSchema = {
        listId: req.params.id,
        title: req.body.title,
        description: req.body.description
    }
    
    const result = UpdateListSchema.safeParse(reqSchema)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    req.body.title = result.data.title
    req.body.description = result.data.description

    next()
}

export function validateDeleteList(req: Request, res: Response, next: NextFunction) {
    const result = DeleteListSchema.safeParse(req.params)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    next()
}

export function validateAddListMember(req: Request, res: Response, next: NextFunction) {
    
}