import { Router } from "express";
import { exchangeCode } from "./auth.controller.js";

const router = Router()

router.post(
    '/exchange',
    exchangeCode
)

export default router