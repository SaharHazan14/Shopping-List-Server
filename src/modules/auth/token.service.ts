import jwt from "jsonwebtoken"
import jwksClient from "jwks-rsa"
import logger from "../../logger.js"

const region = process.env.AWS_REGION
const userPoolId = process.env.COGNITO_USER_POOL_ID
const clientId = process.env.COGNITO_CLIENT_ID

const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`

const client = jwksClient({
    jwksUri: `${issuer}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true
})

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    client.getSigningKey(header.kid!, function (err, key) {
        if (err) {
            logger.error('Failed to get signing key', { kid: header.kid, error: err })
            callback(err, undefined)
            return
        }

        const signingKey = key?.getPublicKey()
        callback(null, signingKey)
    })
}

export function verifyCognitoIdToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            getKey,
            {
                issuer,
                algorithms: ["RS256"]
            },
            (err, decoded) => {
                if (err) {
                    return reject(err)
                }

                const payload = decoded as any

                if (payload.token_use !== "id") {
                    return reject(new Error("Expected ID token"))
                }

                if (payload.aud !== clientId) {
                    return reject(new Error("Invalid audience"))
                }

                resolve(payload)
            }
        )
    })
}

export function verifyCognitoAccessToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            getKey,
            {
                issuer,
                algorithms: ["RS256"]
            },
            (err, decoded) => {
                if (err) return reject(err)

                const payload = decoded as any;

                if (payload.token_use !== "access") {
                    return reject(new Error("Expected access token"))
                }

                if (payload.client_id !== clientId) {
                    return reject(new Error("Invalid client_id"))
                }

                resolve(payload)
            }
        )
    })
}