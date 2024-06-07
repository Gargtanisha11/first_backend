import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  result.push(
    {
      $match: {
        isPublished: "true",
      },
    },
    {
      $skip: page * limit,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        owner: 1,
        title: 1,
        description: 1,
        duration: 1,
        createdAt: 1,
        views: 1,
      },
    }
  );

  const video = await Video.aggregate(result);
  if (!video) {
    throw new ApiError(501, " unable to fetch video data");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, " successfully video data fetched"));
});

const publishAVideo = asyncHandler(async (res, req) => {
  // take the video from res.body
  // checks for required data is present
  // upload thumbnail and videofile on cloudinary
  // delete the local file from machine (already done in uploadoncloudinary middleware)
  // check if is successfully updated on cloudinary
  // create video object and save the data (isPublished=1 and owner = req.user.objetId)
  // return the response with video object
  const { title, description } = res.body;
  const videoLocalPath = res.files.video[0].path;
  const thumbnailLocalPath = res.files.thumbnail[0].path;

  if (!title || !description) {
    throw new ApiError(402, " title and description are required ");
  }

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(401, " video file and thumbnail both are required ");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  if (!videoFile.url) {
    throw new ApiError(
      501,
      "Something went wrong while uploading the  video file on cloudinary"
    );
  }

  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailFile.url) {
    throw new ApiError(
      501,
      "Something went wrong while uploading the thumbnail file on cloudinary"
    );
  }

  const uploadedVideo = await Video.create({
    title,
    description,
    videoFile: videoFile?.url,
    thumbnail: thumbnailFile?.url,
    owner: req.user?._id,
    duration: videoFile?.duration,
    isPublished: true,
  }).select("-isPublished");

  if (!uploadedVideo) {
    throw new ApiError(401, " something went wrong while publishing the video");
  }

  return res
    .status(200)
    .json(200, uploadedVideo, " Successfully uploaded the video");
});

const getVideoById = asyncHandler(async (res, req) => {
  const { videoId } = res.params;
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        owner: {
          userName: 1,
          fullName: 1,
          avatar: 1,
        },
        duration: 1,
        views: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!video) {
    throw new ApiError(501, " Not able to fetch the video");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, " successfully fetch the video by video Id")
    );
});

const updateVideo = asyncHandler(async (res, req) => {
  // get the video Id by res.params
  // get the data want to change from res.body
  // check if data come or not
  // use findByIdAndUpdate to update the field and save
  // check if fields update successfully  or not
  // return the response

  const { videoId } = res.params;
  if (!videoId) {
    throw new ApiError(402, " video Id is required ");
  }
  const { title, description, thumbnail } = res.body;

  const video = await Video.findById(videoId);
  if (!(title || thumbnail || description)) {
    throw new ApiError(401, " fields are required");
  }
  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }
  if (thumbnail) {
    const thumbnailFile = await uploadOnCloudinary(thumbnail);
    if (!thumbnailFile.url) {
      throw new ApiError(501, " not able to upload on Cloudinary");
    }
    video.thumbnail = thumbnailFile.url;
  }
  video.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, video, " successfully update the video"));
});

const deleteVideo = asyncHandler(async (res, req) => {
  const { videoId } = res.params;
  const isDeleted = await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, isDeleted, " Video deleted successfully "));
});

const togglePublishStatus = asyncHandler(async (res, req) => {
  const { videoId } = res.params;
  const video = await Video.findById(videoId);
  video.isPublished = !video.isPublished;
  video.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(new ApiError(200, [], " successfully toggled publish status"));
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
