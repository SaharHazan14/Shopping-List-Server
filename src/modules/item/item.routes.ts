import { Router } from "express";
import { itemController } from "./item.controller";
import { ItemService } from "./item.service";

const router = Router()

router.post('/', itemController.createNewItem)
router.get('/:id', itemController.getItemById)

export default router