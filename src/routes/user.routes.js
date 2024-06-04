import { Router } from "express";
import {
  changeOldPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAcessToken,
  registerUser,
  updateAccountdetails,
  updateCoverImage,
  updateUserAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
)

router.route("/login").post(loginUser)

//Protected Routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-Token").post(refreshAcessToken);
router.route("/change-password").post(verifyJWT,changeOldPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountdetails);
router.route("/update-avatar").patch(verifyJWT,upload.single('avatar'),updateUserAvatar);
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);
router.route("/channel-profile/:username").get(verifyJWT,getUserChannelProfile);
router.route("/watch-history").get(verifyJWT,getWatchHistory);

export default router;
