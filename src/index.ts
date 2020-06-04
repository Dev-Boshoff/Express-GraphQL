import "reflect-metadata";
// import {createConnection} from "typeorm";
// import {User} from "./entity/User";
import "dotenv/config";
import "reflect-metadata";
import express = require('express');
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from "type-graphql";
import { UserResolvers } from "./UserResolvers";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import {verify} from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken } from "./auth";
import cors from "cors"




(async () => {

    const  app = express();

    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials:true
        })
    )


    app.use(cookieParser());

    app.get("/",(_req, res) => res.send("hello"));
    
    app.post("/refresh_token", async(req,res) =>{
        console.log(req.cookies);
        const token = req.cookies.jid;
        if(!token){
            return res.send({ok: false, accessToken :""});            
        }

        let payload : any = null;

        try{
            payload = verify(token,process.env.REFRESH_TOKEN_SECRET!)
        }catch(err){
            console.log(err)
            return res.send({ok: false , accessToken: ""})

        }
 
        // token is valid and send back access token
        const user = await User.findOne({id: payload.userId});

         if (!user){
            return res.send({ok: false, accessToken: ""});
         }

         if(user.tokenVersion !== payload.tokenVersion){
            return res.send({ok: false, accessToken: ""});            
         }



         return res.send({ok: true, accessToken: createAccessToken(user)});
    }) 


    await createConnection();

    const apolloserver = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolvers]
        }),
        context: ({req, res }) => ({req, res})   
    });

    apolloserver.applyMiddleware({app, cors:false});
    app.listen(4000,() => {
        console.log("express server is runing")
    });
})();

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));
