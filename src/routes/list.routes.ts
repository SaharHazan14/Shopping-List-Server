import { Router } from "express";
import { listController } from "../modules/list/list.controller";

const router = Router();

router.post('/', listController.createList)
router.get('/:id', listController.getListById)
router.get('/', listController.getUserLists)
router.patch('/:id', listController.updateListTitle)
router.delete('/:id', listController.deleteList)

router.post('/:id/member', listController.addListMember)

export default router