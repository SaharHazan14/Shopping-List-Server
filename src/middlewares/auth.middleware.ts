import { Request, Response, NextFunction } from "express";
import { BadRequestError, UnauthorizedError } from "../errors";
import { verifyCognitoAccessToken } from "../modules/auth/token.service";
import { UserService } from "../modules/user/user.service";
import { UserRepository } from "../modules/user/user.repository";
import logger from "../logger";

const userService = new UserService(new UserRepository())

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
        logger.warn('No token provided')
        throw new BadRequestError("No token provided");
    }

    const payload = await verifyCognitoAccessToken(token)

    const user = await userService.findByCognitoSub(payload.sub)
    if (!user) {
        logger.warn('User not provisioned', { sub: payload.sub })
        return res.status(401).json({ message: "User not provisioned" });
    }

    req.user = user

    next()
}

function extractToken(authHeader: string | undefined): string {
    if (!authHeader) {
        logger.warn('Missing Authorization header')
        throw new UnauthorizedError("Missing Authorization header");
    }
    if (!authHeader.startsWith("Bearer ")) {
        logger.warn('Invalid Authorization header format', { header: authHeader })
        throw new UnauthorizedError("Invalid Authorization header format");
    }
    
    return authHeader.split(" ")[1];
}
