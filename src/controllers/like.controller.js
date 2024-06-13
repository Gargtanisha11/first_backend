import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import {Video} from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";

const toggleCommentLike = asyncHandler(async (req, res) => {
  // get the userId from req.user._id,and comment id from req.params
  const { _id } = req.user;
  const { commentId } = req.params;

  // check for validity of comment id
  if (!isValidObjectId(commentId)) {
    throw new ApiError(403, " not valid comment ID");
  }

  // if comment is liked by user or not
  const likeDoc = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(_id),
        comment: new mongoose.Types.ObjectId(commentId),
      },
    },
  ]);

  // if like means length > 0
  if (likeDoc.length > 0) {
    try {
      // if like then we delete it
      const isDeleted = await Like.findByIdAndDelete(likeDoc[0]._id);

      return res
        .status(200)
        .json(new ApiResponse(200, isDeleted, " successfully deleted the like"));
    } catch (error) {
      throw new ApiError(
        502,
        " something went wrong while deleteing  like" + error
      );
    }
  }
  // other wise if is not liked by user
  else if (!likeDoc.length) {
    try {
      // then we create a like document
      if(! await Comment.findById(commentId)){
        throw new ApiError(401," not valid comment Id")
      }
        const like = await Like.create({
        comment: commentId,
        likedBy: _id,
      });
    
      return res
        .status(200)
        .json(new ApiResponse(200, like, " successfully add your like"));

      
    } catch (error) {
      throw new ApiError(
        502,
        " something went wrong while creating  like" + error
      );
    }
  }
});

const toggleVideoLike = asyncHandler(async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, " not a valid video id");
  }

  const likeDoc = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
  ]);
  if (likeDoc.length > 0) {
    
    try {
      const isDeleted = await Like.findByIdAndDelete(likeDoc[0]._id);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            isDeleted,
            " successfully deleted  like from video"
          )
        );
    } catch (error) {
      throw new ApiError(501, "error is " + error);
    }
  }
  else if (!likeDoc.length) {
    try {
      if(! await Video.findById(videoId)){
        throw new ApiError(401," not valid videoId");
      }
      const like = await Like.create({
        video: videoId,
        likedBy: req.user._id,
      });
  
      return res
        .status(200)
        .json(new ApiResponse(200, like, " successfully add the likeon video"));
    } catch (error) {
       throw new ApiError(501," error is " +error);
    }
  }
});

const toggleTweetLike=asyncHandler(async(req,res)=>{
   const user= req.user;
   const {tweetId}= req.params;

   if(!isValidObjectId(tweetId)){
    throw new ApiError(403, "not valid tweet id");
   }

   const likeDoc = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        tweet: new mongoose.Types.ObjectId(tweetId),
      },
    },
  ]);

  if (likeDoc.length > 0) { 
    try {
      const isDeleted = await Like.findByIdAndDelete(likeDoc[0]._id);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            isDeleted,
            " successfully deleted  like from video"
          )
        );
    } catch (error) {
      throw new ApiError(501, "error is " + error);
    }
  }
  else if (!likeDoc.length) {
    try {
      if(! await Video.findById(tweetId)){
        throw new ApiError(401," not valid videoId");
      }
      const like = await Like.create({
        video: tweetId,
        likedBy: req.user._id,
      });
  
      return res
        .status(200)
        .json(new ApiResponse(200, like, " successfully add the likeon video"));
    } catch (error) {
       throw new ApiError(501," error is " +error);
    }
  }
  
});


const getLikedVideos= asyncHandler(async(req,res)=>{
  const user= req.user;

  const likedVideo=await Like.aggregate([
    {
      $match:{
        likedBy: new mongoose.Types.ObjectId(user._id),
        comment :null,
        tweet:null
      }
    },
    

    {
       $lookup:{
          from:"videos",
          localField:"video",
          foreignField:"_id",
          as :"video",
       }
    },
     
    {
      $project:{
        video:{
          _id:1,
          title:1,
          description:1,
          thumbnails:1,
          owner:1
        }
      }
    }
  ]);

  return res.status(200).json(new ApiResponse(200,likedVideo," successfully fetch liked video "));
})

export { toggleCommentLike ,toggleVideoLike, toggleTweetLike,getLikedVideos};
