import { Request, Response } from "express"
import { UserService } from "./user.service"
import { UserRepository } from "./user.repository"
import logger from "../../logger"

const service = new UserService(new UserRepository())

class UserController {
    async getCurrentUser(req: Request, res: Response) {
        const userId = req.user.id

        logger.info('Fetching current user', { userId })
        const user = await service.findById(userId)
        logger.debug('Fetched user', { userId })
        res.status(200).json(user)
    }
}

export const userController = new UserController()