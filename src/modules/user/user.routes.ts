import { Router } from 'express';
import { userController } from './user.controller';

const router = Router()

router.get(
    '/me',
    userController.getCurrentUser
)

export default router