import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controller.js";

const router =Router();
router.use(verifyJWT);

router.route("/createTweet").post(createTweet);
router.route("/getUserTweet").get(getUserTweet);
router.route("/updateTweet").patch(updateTweet);
router.route("/deleteTweet").delete(deleteTweet);

export default router;