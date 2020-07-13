import {User} from "./entity/User";
import {sign} from "jsonwebtoken";
import "dotenv/config";

export const createAccessToken = (user:User) => {
  return sign({userId: user.id},process.env.ACCESS_TOKEN_SECRECT!,{expiresIn:"15m"})
}

export const createRefreshToken = (user:User) => {
  return sign({userId: user.id, tokenVersion: user.tokenVersion  },process.env.REFRESH_TOKEN_SECRET!,{expiresIn:"1d"})
}

export const createForgottenPassword = (user:User) => {
  return sign({userId: user.id, tokenVersion: user.tokenVersion  },process.env.NEW_PASSWORD_SECRET!,{expiresIn:"2d"})
}
