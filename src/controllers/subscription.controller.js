import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(403, " not a valid channel id");
  }

  const subsDoc = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);
 
  if (!subsDoc.length) {
    try {
      if (!(await User.findById(channelId))) {
        throw new ApiError(403, "not a valid channel id");
      }
      const subscript = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            subscript,
            " successfully subscribed the channel"
          )
        );
    } catch (error) {
      throw new ApiError(501, " something went wrong " + error);
    }
  } else if (subsDoc.length > 0) {
    try {
      const isDeleted = await Subscription.findByIdAndDelete(subsDoc[0]._id);
      return res
        .status(200)
        .json(new ApiResponse(200, isDeleted, " unsubscribed successfully"));
    } catch (error) {
      throw new ApiError(502, " not able to subscribed");
    }
  }
  // const subscript= await Subscription.create({
  //     subscriber:req.user._id,
  //     channel:channelId,
  //   })

  //   return res.status(200).json(new ApiResponse(200,subscript," successfully subscribed the channel"))
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(403, " channel id is not valid ");
  }
  const subscriber = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $project: {
        subscriber: {
          _id:1,
          userName: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, subscriber, " list of the subscriber "));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const user = req.user;
  const subscribedChannel = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $project: {
        _id:0,
        channelName:{$first:"$channel.userName"},
        channelFullname:{$first:"$channel.fullName"},
        channelAvatar:{$first:"$channel.avatar"}
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannel, " subscribed channel list "));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
