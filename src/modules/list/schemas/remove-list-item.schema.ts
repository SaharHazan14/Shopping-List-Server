import { z } from "zod"
import { positiveInt } from "../../../utils/zod-helpers"

export const RemoveListItemSchema = z.object({
    listId: positiveInt("list ID"),
    itemId: positiveInt("item ID")
})