import { z } from "zod"

export const CreateListSchema = z.object({
    title: z
        .string({
            error: (issue) => 
                issue.input === undefined
                    ? "title is required"
                    : "title must be a string"
        })
        .trim()
        .min(2, {error: "title must be at least 2 characters long"})
        .transform((val) => val.trim()),
    description: z
        .string({
            error: (issue) => 
                issue !== undefined && issue.input !== null && typeof issue.input !== "string"
                    ? "description must be a string if provided"
                    : undefined
        })
        .optional()
        .nullable()
        .transform((val) => typeof val === "string" && val.trim().length > 0 ? val.trim() : null),
})