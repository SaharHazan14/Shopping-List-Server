import { Router } from "express";
import { listController } from "../modules/list/list.controller";

const router = Router();

router.post('/', listController.createNewList)
router.get('/', listController.getById)

export default router