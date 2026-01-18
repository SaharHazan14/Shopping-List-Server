import { Router } from "express";
import { itemController } from "./item.controller";
import { validateCreateItem, validateDeleteItem, validateGetItemById, validateGetUserItems, validateUpdateItem } from "./item.validator";

const router = Router()

router.post('/', validateCreateItem, itemController.createItem)
router.get('/:id', validateGetItemById, itemController.getItemById)
router.get('/', validateGetUserItems, itemController.getUserItems)
router.patch('/:id', validateUpdateItem, itemController.updateItem)
router.delete('/:id', validateDeleteItem, itemController.deleteItem)

export default router