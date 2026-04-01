import { Router } from 'express';
import { userController } from './user.controller.js';

const router = Router()

router.get(
    '/me',
    userController.getCurrentUser
)

export default router