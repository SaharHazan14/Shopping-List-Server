import { BadRequestError } from "../errors";

export function requireField(field: unknown, fieldName: string) {
    if (field === undefined) {
        throw new BadRequestError(`${fieldName} is required`)
    }

    if (field === null) {
        throw new BadRequestError(`${fieldName} can't be null`)
    }
}

export function requireString(field: unknown, fieldName: string): string {
    requireField(field, fieldName)
    
    if (typeof field !== "string") {
        throw new BadRequestError(`${fieldName} must be a string`)
    }

    return field
}

export function requireNonEmptyString(field: unknown, fieldName: string): string {
    const stringField = requireString(field, fieldName)

    if (stringField.trim().length === 0) {
        throw new BadRequestError(`${fieldName} cannot be empty`)
    }

    return stringField
}

export function requiredNumber(field: unknown, fieldName: string): number {
    requireField(field, fieldName)

    if (typeof field !== "number") {
        throw new BadRequestError(`${field} must be a number`)
    }

    return field
}

export function requiredPositiveInt(field: unknown, fieldName: string): number {
    const number = requiredNumber(field, fieldName)

    if (!Number.isInteger(number) || number <= 0) {
        throw new BadRequestError(`${fieldName} must be a positive integer`)
    }

    return number
}

export function optionalString(field: unknown, fieldName: string): string | undefined {
    if (field === undefined || field === null) {
        return undefined
    }

    if (typeof field !== "string") {
        throw new BadRequestError(`${fieldName} must be a string`)
    }

    const trimmedField = field.trim()

    return trimmedField === "" ? undefined : trimmedField
}

export function requiredIntParam(param: unknown, paramName: string): number {
    if (param === undefined) {
        throw new BadRequestError(`missing route parameter: ${paramName}`)
    }

    if (typeof param !== "string") {
        throw new BadRequestError(`Invalid route parameter: ${paramName}`)
    }

    const parsedParam = Number(param)

    if (!Number.isInteger(parsedParam) || parsedParam <= 0) {
        throw new BadRequestError(`${paramName} must be a positive integer`)
    }

    return parsedParam
}

export function parseBooleanQuery(param: unknown, paramName: string, defaultValue: boolean = true): boolean {
    if (param === undefined) {
        return defaultValue
    }

    if (typeof param !== "string") {
        throw new BadRequestError(`${paramName} must be a string "true" or "false"`)
    }

    if (param.toLowerCase() === "true") {
        return true
    }

    if (param.toLowerCase() === "false") {
        return false
    }

    throw new BadRequestError(`${paramName} must be either "true" or "false"`)
}

export function parseStringQuery(param: unknown, paramName: string): string | undefined {
    if (param === undefined) {
        return undefined
    }

    if (typeof param !== "string") {
        throw new BadRequestError(`${paramName} must be a string`)
    }

    if (param.trim() === "") {
        throw new BadRequestError(`${paramName} cannot be empty`)
    }

    return param
}