import { BadRequestError } from "../errors";

export function validateCreateListInput(body: any) {
    if (typeof body.title !== "string") {
        throw new BadRequestError("title is required and must be a string")
    }

    const title = body.title.trim()
    if (title.length < 2) {
        throw new BadRequestError("title must be at least 2 characters long")
    }

    let description: string | null
    if (body.description === undefined || body.description === null) {
        description = null
    } else if (typeof body.description === "string") {
        description = body.description.trim()
    } else {
        throw new BadRequestError("description must be a string or null")
    }

    return { title, description }
}

export function validateGetListByIdParam(params: any): number {
    if (params.id === undefined) {
        throw new BadRequestError("list ID is required")
    }

    const id = Number(params.id)
    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("list ID must be a positive integer")
    }

    return id
}

export function validateGetUserListsQuery(query: any): boolean {
    if (query.includeMember === undefined || query.includeMember === "false") {
        return false
    }

    if (query.includeMember === "true") {
        return true
    }

    throw new BadRequestError("includeMember must be 'true' or 'false'")
}

export function validateUpdateListInput(params: any, body: any) {
    let result: {
        listId: number,
        title?: string,
        description?: string | null
    }
    
    if (params.id === undefined) {
        throw new BadRequestError("list ID is required")
    }

    const id = Number(params.id)
    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
        throw new BadRequestError("list ID must be a positive integer")
    }

    result = { listId: id }

    if (body.title !== undefined) {
        if (typeof body.title !== "string") {
            throw new BadRequestError("title is required and must be a string")
        }

        const title = body.title.trim()
        if (title.length < 2) {
            throw new BadRequestError("title must be at least 2 characters long")
        }

        result.title = title
    }

    if (body.description !== undefined) {
        if (body.description === null) {
            result.description = null
        } else if (typeof body.description === "string") {
            result.description = body.description.trim()
        } else {
            throw new BadRequestError("description must be a string or null")
        }
    }

    if (body.title === undefined && body.description === undefined) {
        throw new BadRequestError("at least one field must be provided for update")
    }

    return result
}