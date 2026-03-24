import { Request, Response } from "express"
import axios from "axios"
import { verifyCognitoIdToken } from "./token.service"
import { UserService } from "../user/user.service"
import { UserRepository } from "../user/user.repository"
import logger from "../../logger"

const userService = new UserService(new UserRepository())

export async function exchangeCode(req: Request, res: Response) {
  const { code } = req.body
  logger.debug("Received authorization code", { hasCode: Boolean(code) })
  
  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" })
  }

  try {
    const basicAuth = Buffer.from(
      `${process.env.COGNITO_CLIENT_ID}:${process.env.COGNITO_CLIENT_SECRET}`
    ).toString("base64")

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.CALLBACK_URL!
    })

    logger.debug("Sending token request to Cognito", { redirectUri: process.env.CALLBACK_URL })

    const tokenResponse = await axios.post(
      `https://${process.env.COGNITO_DOMAIN}/oauth2/token`,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`
        }
      }
    )

    const { access_token, id_token, refresh_token } = tokenResponse.data

    const idPayload = await verifyCognitoIdToken(id_token)
    
    const { sub, email } = idPayload

    const user = await userService.getOrCreateUser({
      cognitoSub: sub,
      email
    })

    return res.status(200).json({
      accessToken: access_token,
      idToken: id_token,
      refreshToken: refresh_token
    })
  } catch (err: any) {
    logger.error('Token exchange failed', { error: err.response?.data || err.message })
    return res.status(500).json({ message: "Token exchange failed", error: err.response?.data })
  }
}
