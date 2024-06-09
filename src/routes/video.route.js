import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  getVideoById,
  publishAVideo,
  deleteVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

// router function from express
const router = Router();

router.use(verifyJWT); // we want to give access to only authorized user
router
  .route("/")
  .get(getAllVideos) // get the video
  .post(
    // upload a video
    upload.fields([
      {
        name: "video",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),publishAVideo
  );

router
  .route("/:videoId")
  .get(getVideoById) // get the video by id
  .delete(deleteVideo) // delete the video by Id
  .patch(upload.single("thumbnail"), updateVideo); // update the video by Id

router
  .route("/togglePublishStatus") // toggle publish status
  .patch(togglePublishStatus);

export default router;
