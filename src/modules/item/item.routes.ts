import { Router } from "express";
import { itemController } from "./item.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { CreateItemBodySchema, GetUserItemsQuerySchema, ItemIdParamSchema, UpdateItemBodySchema } from "./item.schema";

const router = Router()

router.post(
    '/',
    validateRequest({ body: CreateItemBodySchema }),
    itemController.createItem
)

router.get(
    '/:itemId',
    validateRequest({ params: ItemIdParamSchema }),
    itemController.getItemById
)

router.get(
    '/',
    validateRequest({ query: GetUserItemsQuerySchema }),
    itemController.getUserItems
)

router.patch(
    '/:itemId',
    validateRequest({ params: ItemIdParamSchema, body: UpdateItemBodySchema }),
    itemController.updateItem
)

router.delete(
    '/:itemId',
    validateRequest({ params: ItemIdParamSchema }),
    itemController.deleteItem
)

export default router