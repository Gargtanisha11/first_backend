import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const user = req.user;
  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user?._id), // get the all video of user
      },
    },
    {
      $facet: {    // for parallel pipeline aggregation
        viewsAndVideos: [
          {
            $group: {
              _id: null, // group the all document in single document
              totalViews: {
                $sum: "$views", // add all views of that document
              },
              totalVideos: {
                $sum: 1, // count  the total document by adding 1 for every doc
              },
            },
          },
        ],
        totalLikes: [
          {
            $lookup: {
              // get the no of likes document for a particular video
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
          {
            $addFields: {
              // overWrite the likes field with no of like by using size accumulator for a particular video
              likes: {
                $size: "$likes",
              },
            },
          },
          {
            $group: {
              // group all in one document to get total likes of all videos
              _id: null,
              likes: {
                $sum: "$likes",
              },
            },
          },
        ],
      },
    },
    {
      $project:{
        totalViews:{$first:"$viewsAndVideos.totalViews"},
        totalVideos:{$first:"$viewsAndVideos.totalVideos"},
        totalLikes:{$first:"$totalLikes.likes"}
      }
    }
  ]);


  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(user._id), // get the all document where user channel
      },
    },
    {
      $count: "totalSubscriber", // then count the no of dcument as save as totalSubscriber
    },
  ]);
   videoStats[0]["totalSubscriber"]=subscribers[0]["totalSubscriber"];
   return res.status(200).json( new ApiResponse(200,videoStats," video stats data"));
});

const getChannelVideos=asyncHandler(async(req,res)=>{
  const {_id} = req.user;
  const videos= await Video.aggregate([
    {
      $match:{
        owner:new mongoose.Types.ObjectId(_id)
      }
    },
   
  ]);

  return res.status(200).json( new ApiResponse(200,videos," channel videos "));
})

export { getChannelStats ,getChannelVideos };
