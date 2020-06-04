import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int} from 'type-graphql';
import { User } from './entity/User';
import {hash, compare} from 'bcryptjs';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';
import { verify } from "jsonwebtoken";
import {SettingsInput} from "../src/graphTypes" 




@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field( () => User)
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
  map(@Ctx() {payload}: MyContext) {
    return `${payload?.userId}`
  }

  @Query(() => [User])
  users(){
    return User.find();
  }

  @Query(() => User,  { nullable : true})
  me(@Ctx() context: MyContext){
    const authorization = context.req.headers['authorization'];

  try {
    const token = authorization?authorization.split(" ")[1]:"";
    const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRECT!)
    return User.findOne(payload.userId)
  } catch (err) {
    console.log(err)
    return null;
  }
  }

  @Mutation( () => LoginResponse )
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() {res}: MyContext
  ): Promise<LoginResponse> {

    const user = await User.findOne({where: {email} });

    if (!user){
      throw new Error('User does not exist');            
    }
 
    const valid = await compare(password,user.password);
     
    if(!valid){
      throw new Error ('Password is invalid');
    }

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken:createAccessToken(user),  
      user
    }
  } 

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async revokeRefreshTokensForUser(
    @Arg('userId',() => Int) userId: number
  )
  {
      await getConnection().getRepository(User).increment({id:userId}, "tokenVersion",1  )
      return true;
  }
  
  @Mutation(() => Boolean)
  async logout( @Ctx() {res}: MyContext )

  {
    sendRefreshToken(res,"")
    return true
  }



  
  @Mutation(() => User)
  async draw_settigns(
    @Arg('style') style: SettingsInput,
    @Arg('id') userId: number
  ){
     try{
     
    //  await getConnection()
    // .createQueryBuilder().update(User)
    // .set({ draw_setting:style })
    // .where("id = :id", { id: userId })
    // .execute();
     const styles =  { draw_setting:style }
      const book = await User.findOne({ where: {id : userId } });
      if (!book) throw new Error("Book not found!");
      Object.assign(book, styles);
      await book.save();
      return book;
    } catch(err){
      console.log(err);     
      return false;  
    }    
    //return true;
  }


  @Mutation( () => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {

    const hashedPassword = await hash(password,12);
    try{
      await User.insert({
        email,
        password: hashedPassword
      });  
    } catch(err){
      console.log(err);     
      return false;
    }    
    return true;
  } 

}