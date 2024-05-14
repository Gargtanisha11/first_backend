// require ('dotenv').config({path:'./env'})
import dotenv from "dotenv"

import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})


connectDB()  // when the db connect the tit return the promise 
.then(()=>{
    app.on("error",(error)=>{
        console.log(`the error ${error}`);
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log("Server is running on port ",process.env.PORT);
        console.log(`server is running on the port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log( "MONGO DB CONNECTION FAILED ",err)
})


















//import express from "express"
//const app=express();


// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     app.on("error",(error)=>{   // error even listener
//         console.log("Err: ",error);
//         throw error
//     })

//    app.listen(process.env.PORT,()=>{
//     console.log(`App is listening on port ${porcess.env.PORT}`);  // listener 
//    })

//   } 
//   catch (error) {
//     console.error("Error", error);
//     throw error;
//   }
// })(); //iifes for
