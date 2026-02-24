import { Request, Response } from "express"
import axios from "axios"
import { verifyCognitoIdToken } from "./token.service"
import { UserService } from "../user/user.service"
import { UserRepository } from "../user/user.repository"

const userService = new UserService(new UserRepository())

export async function handleCallback(req: Request, res: Response) {
  const code = req.query.code as string
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
    
    // add check for exceptions
    const idPayload = await verifyCognitoIdToken(id_token)
    
    const { sub, email } = idPayload

    const user = await userService.getOrCreateUser({
      cognitoSub: sub,
      email
    })

    return res.json({ access_token, id_token, refresh_token })  

  } catch (err: any) {
    console.error(err.response?.data || err.message)
    return res.status(500).json({ message: "Token exchange failed" })
  }
}
