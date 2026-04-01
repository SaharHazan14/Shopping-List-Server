import { Router } from "express";
import { listController } from "./list.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { AddListItemBodySchema, AddListMemberBodySchema, CreateListBodySchema, GetUserListsQuerySchema, 
         ListIdItemIdParamsSchema, ListIdMemberIdParamsSchema, ListIdParamSchema, UpdateListBodySchema, 
         UpdateListItemBodySchema, UpdateListMemberBodySchema } from "./list.schema.js";

const router = Router();

router.post(
    '/',
    validateRequest({ body: CreateListBodySchema }),
    listController.createList
)

router.get(
    '/:listId',
    validateRequest({ params: ListIdParamSchema }),
    listController.getListById
)

router.get(
    '/',
    validateRequest({ query: GetUserListsQuerySchema }),
    listController.getUserLists
)

router.patch(
    '/:listId',
    validateRequest({ params: ListIdParamSchema, body: UpdateListBodySchema }),
    listController.updateList
)

router.delete(
    '/:listId',
    validateRequest({ params: ListIdParamSchema }),
    listController.deleteList
)

router.post(
    '/:listId/member',
    validateRequest({ params: ListIdParamSchema, body: AddListMemberBodySchema }),
    listController.addListMember
)

router.get(
    '/:listId/member',
    validateRequest({ params: ListIdParamSchema }),
    listController.getListMembers
)

router.patch(
    '/:listId/member/:memberId',
    validateRequest({ params: ListIdMemberIdParamsSchema, body: UpdateListMemberBodySchema }),
    listController.updateListMember
)

router.delete(
    '/:listId/member/:memberId',
    validateRequest({ params: ListIdMemberIdParamsSchema }),
    listController.removeListMember
)

router.post(
    '/:listId/item',
    validateRequest({ params: ListIdParamSchema, body: AddListItemBodySchema }),
    listController.addListItem
)

router.get(
    '/:listId/item',
    validateRequest({ params: ListIdParamSchema }),
    listController.getListItems
)

router.patch(
    '/:listId/item/:itemId',
    validateRequest({ params: ListIdItemIdParamsSchema, body: UpdateListItemBodySchema}),
    listController.updateListItem
)

router.delete(
    '/:listId/item/:itemId',
    validateRequest({ params: ListIdItemIdParamsSchema }),
    listController.removeListItem
)

export default router