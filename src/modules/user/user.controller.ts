import { Request, Response } from "express"
import { UserService } from "./user.service.js"
import { UserRepository } from "./user.repository.js"

const service = new UserService(new UserRepository())

class UserController {
    async getCurrentUser(req: Request, res: Response) {
        const userId = req.user.id

        const user = await service.findById(userId)
        res.status(200).json(user)
    }
}

export const userController = new UserController()