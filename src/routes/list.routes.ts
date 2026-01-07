import { Router } from "express";
import { listController } from "../modules/list/list.controller";

const router = Router();

router.post('/', listController.createList)
router.get('/:id', listController.getListById)
router.get('/', listController.getUserLists)
router.patch('/:id', listController.updateList)
router.delete('/:id', listController.deleteList)

/*
post('/:id/member', listController.addListMember)
router.get('/:id/member', listController.getListMembers)
// router.get('/member', listController.getUserListMemberships)
router.patch('/:id/member', listController.updateMemberRole)
router.delete('/:id/member/:memberId', listController.removeListMember)
*/

export default router