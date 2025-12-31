import { Router } from "express";
import { itemController } from "../modules/item/item.controller";
import { ItemService } from "../modules/item/item.service";

const router = Router()

router.post('/', itemController.createNewItem)
router.get('/:id', itemController.getItemById)

export default router