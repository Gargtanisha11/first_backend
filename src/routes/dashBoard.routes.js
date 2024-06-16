import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();
router.use(verifyJWT);
 router.route("/userStats").get(getChannelStats);
 router.route("/channelVideos").get(getChannelVideos);

 export default router;