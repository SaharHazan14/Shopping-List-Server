import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_r8jOu7JSM/.well-known/jwks.json",
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid!, (err, key) => {
    if (err) {
      console.error("Error fetching signing key:", err);
      return callback(err, undefined);
    }
    const signingKey = key!.getPublicKey();
    callback(null, signingKey);
  });
}

export function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_r8jOu7JSM",
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ message: "Invalid token", error: err.message });
      }
      req.user = decoded;
      next();
    }
  );
}
