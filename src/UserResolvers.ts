import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int } from 'type-graphql';
import { User } from './entity/User';
import { hash, compare } from 'bcryptjs';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken, createForgottenPassword } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';
import { verify } from "jsonwebtoken";
import { SettingsInput,metadataObjectInput} from "../src/graphTypes";
import nodemailer = require('nodemailer');


@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolvers {
  @Query(() => String)
  hello() {
    return "hi"
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  map(@Ctx() { payload }: MyContext) {
    return `${payload?.userId}`
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: MyContext) {
    const authorization = context.req.headers['authorization'];
    try {
      const token = authorization ? authorization.split(" ")[1] : "";
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRECT!)
      return User.findOne(payload.userId)
    } catch (err) {
      console.log("You are not logged in")
      return null;
    }
  }

  @Mutation(() => Boolean, { nullable: true })
  async resetPass(
    @Arg('email') email: string,
    @Arg('new_password') new_password: string,
    @Arg('token') reset_token: string
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });

    const hashedPassword = await hash(new_password, 12);

    const payload: any = verify(reset_token, process.env.NEW_PASSWORD_SECRET!)

    if (user?.id === payload.userId) {
      try {
        await User.update(payload.userId, {
          password: hashedPassword
        })
        return true;
      } catch (err) {
        console.log(err);
        throw new Error('update error');
      }
    } else {
      throw new Error('Token/User error');
    }
  }

  @Mutation(() => String, { nullable: true })
  async forgotPass(
    @Arg('email') email: string,
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });
    if (user) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mapbearing@gmail.com',
          pass: process.env.MAIL_PASSWORD!
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      var token = createForgottenPassword(user)
      var url = process.env.CORS + "/forgotten?passtoken="
      var mailOptions = {
        from: 'mapbearing@gmail.com',
        to: email,
        subject: 'Reset password',
        text: 'This link will expire in 48 hours. Please click on the link to reset password: ' + `${url}${token}`
      };

      let promise = await transporter.sendMail(mailOptions).then((resolve) => {
        console.log(resolve);
        return true
      }).catch((err) => {
        console.log(err)
        return false;
      })

      if (promise) {
        return true
      } else {
        throw new Error('Email error');
      }
    } else {
      throw new Error('User not found');
    }

  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('User does not exist');
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error('Password is invalid');
    }

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async revokeRefreshTokensForUser(
    @Arg('userId', () => Int) userId: number
  ) {
    await getConnection().getRepository(User).increment({ id: userId }, "tokenVersion", 1)
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "")
    return true
  }




  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async draw_settigns(
    @Arg('style') style: SettingsInput,
    @Arg('id') userId: number
  ) {
    try {
      const styles = { draw_setting: style }
      const user = await User.findOne({ where: { id: userId } });
      if (!user) throw new Error("No styles");
      Object.assign(user, styles);
      await user.save();
      return user;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async draw_metadata(
    @Arg('metadata') metadata: metadataObjectInput,
    @Arg('id') userId: number
  ) {
    try {
      const metadataObj = {draw_metadata:metadata }
      const user = await User.findOne({ where: { id: userId } });
      if (!user) throw new Error("No metadata");
      Object.assign(user, metadataObj);
      await user.save();
      return user;
    } catch (err) {
      throw new Error('Cannot fetch Data')
    }
  }


  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    const user = await User.findOne({ where: { email } });

    if (user) {
      throw new Error('User already exists');
    }
    const hashedPassword = await hash(password, 12);
    try {
      await User.insert({
        email,
        password: hashedPassword
      });
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }

}