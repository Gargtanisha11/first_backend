import express from "express"
import cors from "cors"
import cookieParser  from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    crenditial:true}
))

app.use(express.json({
    limit:"16kb",
}))// json file in from app

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))// url encoder

app.use(express.static("public")) // file for put some file on server file name is public

app.use(cookieParser())


export {app}