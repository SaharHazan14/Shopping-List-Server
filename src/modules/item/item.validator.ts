import { NextFunction, Request, Response } from "express";
import { CreateItemSchema } from "./schemas/create-item.schema";
import { BadRequestError } from "../../errors";
import { GetItemByIdSchema } from "./schemas/get-item-by-id.schema";
import { GetUserItemsSchema } from "./schemas/get-user-items.schema";
import { UpdateItemSchema } from "./schemas/update-item.schema";
import { DeleteItemSchema } from "./schemas/delete-item.schema";


export function validateCreateItem(req: Request, res: Response, next: NextFunction) {
    const result = CreateItemSchema.safeParse(req.body)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    req.body.name = result.data.name
    req.body.category = result.data.category

    next()
}

export function validateGetItemById(req: Request, res: Response, next: NextFunction) {
    const result = GetItemByIdSchema.safeParse(req.params)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    next()
}

export function validateGetUserItems(req: Request, res: Response, next: NextFunction) {
    const result = GetUserItemsSchema.safeParse(req.query)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }
    
    req.query.global = String(result.data.global)
    
    next()
}

export function validateUpdateItem(req: Request, res: Response, next: NextFunction) {
    const reqSchema = {
        itemId: req.params.id,
        name: req.body.name,
        category: req.body.category,
        imageUrl: req.body.imageUrl
    }

    const result = UpdateItemSchema.safeParse(reqSchema)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    req.body.name = result.data.name,
    req.body.category = result.data.category

    next()
}

export function validateDeleteItem(req: Request, res: Response, next: NextFunction) {
    const result = DeleteItemSchema.safeParse(req.params)
    if (!result.success) {
        throw new BadRequestError(result.error.issues.map(i => i.message).join(", "))
    }

    next()
}