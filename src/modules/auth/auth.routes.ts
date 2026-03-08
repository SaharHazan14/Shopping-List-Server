import { Router } from "express";
import { exchangeCode } from "./auth.controller";

const router = Router()

router.post(
    '/exchange',
    exchangeCode
)

export default router