import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { MyContext } from "./MyContext";
import { verify } from "jsonwebtoken";
import "dotenv/config";

export const isAuth: Middleware<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];


  if (!authorization) {
    throw new Error("not authenticated")
  }

  try {
    const token = authorization.split(" ")[1];
    console.log(token + " secret " + process.env.ACCESS_TOKEN_SECRECT!);

    const payload = verify(token, process.env.ACCESS_TOKEN_SECRECT!)
    context.payload = payload as any;

  } catch (err) {
    console.log(err)
    throw new Error("not authenticated")
  }
  return next();
}