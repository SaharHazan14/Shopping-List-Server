import { BadRequestError } from "../errors"

export function parseEnum<T extends Record<string, string>>(
    enumObject: T,
    value: unknown,
    fieldName = "value"
): T[keyof T] {
    if (
        typeof value === 'string' && 
        Object.values(enumObject).includes(value as T[keyof T])
    ) {
        return value as T[keyof T]
    }

    throw new BadRequestError(`Invalid ${fieldName}`)
}