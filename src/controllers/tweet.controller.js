import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet=asyncHandler(async(req,res)=>{
    const user= req.user;
     const {content} =req.body;
     console.log(content);
    if(!content){
        throw new ApiError(403 , " content is required ");
    }

    const tweet = await Tweet.create({
        owner:user._id,
        content:content,
    })
    console.log(tweet)
    if(tweet==0){
        throw new ApiError(501," something went wrong while creating tweet");
    }
    return res.status(200).json(new ApiResponse(200,tweet," successfully created tweet"))
});

const getUserTweet=asyncHandler(async(req,res)=>{
    const {userId}= req.params;
    const tweets= await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project:{
                owner:1,
                content:1,
                createdAt:1,
            }
        }
    ]);
   
    console.log(tweets);
    return res.status(200).json(new ApiResponse(200,tweets,"  user tweets"));
});

const updateTweet =asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const {content} =req.body; 
    if(!content){
        throw new ApiError(403," content is required ");
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(402," tweet id shuld be valid");
    }
    const updatedTweet= await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content
        }
     });

    if(updatedTweet.length==0){
        throw new ApiError(401, " something went wrong ");
    }

    return res.status(200).json(new ApiResponse(200, updatedTweet," successfully updated the tweet"));
});

const deleteTweet= asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(400," tweet id should be valid ");
    }
    const isDeleted= await Tweet.findByIdAndDelete(tweetId);

    console.log(isDeleted);
    if(isDeleted.length==0){
        throw new ApiError(500," something went wrong ");
    }
    return res.status(200).json(new ApiResponse(200, isDeleted," deleted successfully your tweet"))
});

export {createTweet,getUserTweet,updateTweet,deleteTweet}