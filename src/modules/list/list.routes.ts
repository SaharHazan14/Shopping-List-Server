import { Router } from "express";
import { listController } from "./list.controller";
import { validateAddListMember, validateCreateList, validateDeleteList, 
         validateGetListById, validateGetListMembers, validateGetUserLists, 
         validateRemoveListMember, 
         validateUpdateList, validateUpdateListMember } from "./list.validator";

const router = Router();

router.post('/', validateCreateList, listController.createList)
router.get('/:id', validateGetListById, listController.getListById)
router.get('/', validateGetUserLists, listController.getUserLists)
router.patch('/:id', validateUpdateList, listController.updateList)
router.delete('/:id', validateDeleteList, listController.deleteList)

router.post('/:id/member', validateAddListMember, listController.addListMember)
router.get('/:id/member', validateGetListMembers, listController.getListMembers)
router.patch('/:listId/member/:memberId', validateUpdateListMember, listController.updateListMember)
router.delete('/:listId/member/:memberId', validateRemoveListMember, listController.removeListMember)

export default router