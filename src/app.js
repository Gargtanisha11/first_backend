import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    crenditial: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
); // json file in from app

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
); // url encoder

app.use(express.static("public")); // file for put some file on server file name is public

app.use(cookieParser());


//import routers 

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashBoard.routes.js"

// route declartion
app.use("/api/v1/users",userRouter)// middleware to give control to userrouter when "users " url hits 
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/playlists",playlistRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/subscriptions",subscriptionRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/dashboard",dashboardRouter);
export { app };
