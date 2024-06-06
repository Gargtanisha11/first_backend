import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 0, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  var result = [];

  // pipleine for searching  video on the basis of  the query
  if (query) {
    result.push({
      $search: {
        index: "search-video",
        text: {
          query: query,
          path: ["title,description"],
        },
      },
    });
  }

  // aggregation pipeline to get the video of a particular user
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError();
    }
    result.push({
      $match: {
        owner: new mongoose.Types.ObjectId(),
      },
    });
  }

  if (sortBy || sortType) {
    result.push({
      $sort: {
        [sortBy]: sortType == desc ? -1 : 1,
      },
    });
  }
  
   const video= await Video.aggregate(result)

});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
