import { Router } from "express";
import { listController } from "./list.controller";
import { validateAddListMember, validateCreateList, validateDeleteList, validateGetListById, validateGetUserLists, validateUpdateList } from "../../validators/list.validator";

const router = Router();

router.post('/', validateCreateList, listController.createList)
router.get('/:id', validateGetListById, listController.getListById)
router.get('/', validateGetUserLists, listController.getUserLists)
router.patch('/:id', validateUpdateList, listController.updateList)
router.delete('/:id', validateDeleteList, listController.deleteList)

router.post('/:id/member', validateAddListMember, listController.addListMember)

/*
post('/:id/member', listController.addListMember)
router.get('/:id/member', listController.getListMembers)
// router.get('/member', listController.getUserListMemberships)
router.patch('/:id/member', listController.updateMemberRole)
router.delete('/:id/member/:memberId', listController.removeListMember)
*/

export default router