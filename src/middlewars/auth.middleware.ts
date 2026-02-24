import { Request, Response, NextFunction } from "express";
import { BadRequestError, UnauthorizedError } from "../errors";
import { verifyCognitoAccessToken } from "../modules/auth/token.service";
import { UserService } from "../modules/user/user.service";
import { UserRepository } from "../modules/user/user.repository";

const userService = new UserService(new UserRepository())

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
        throw new BadRequestError("No token provided");
    }

    const payload = await verifyCognitoAccessToken(token)

    const user = await userService.findByCognitoSub(payload.sub)
    if (!user) {
        return res.status(401).json({ message: "User not provisioned" });
    }

    req.user = user

    next()
}

function extractToken(authHeader: string | undefined): string {
    if (!authHeader) {
        throw new UnauthorizedError("Missing Authorization header");
    }
    if (!authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Invalid Authorization header format");
    }
    
    return authHeader.split(" ")[1];
}
