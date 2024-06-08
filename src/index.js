// require ('dotenv').config({path:'./env'})
import dotenv from "dotenv";
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



















