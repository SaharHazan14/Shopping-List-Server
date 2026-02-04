import { Router } from "express";
import { listController } from "./list.controller";
import { validateAddListItem, validateAddListMember, validateCreateList, validateDeleteList, 
         validateGetListById, validateGetListItems, validateGetListMembers, validateGetUserLists, 
         validateRemoveListItem, 
         validateRemoveListMember, 
         validateUpdateList, validateUpdateListItem, validateUpdateListMember } from "./list.validator";

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

router.post('/:id/item', validateAddListItem, listController.addListItem)
router.get('/:id/item', validateGetListItems ,listController.getListItems)
router.patch('/:listId/item/:itemId', validateUpdateListItem, listController.updateListItem)
router.delete('/:listId/item/:itemId', validateRemoveListItem, listController.removeListItem)

export default router