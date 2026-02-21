import { Router } from "express";
import { handleCallback } from "./auth.controller";

const router = Router()

router.get(
    '/callback',
    handleCallback
)

export default router