//controller for comment
 // get Video comment
 // add comment
 // delete comment
 // update comment
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req, res) => {
  // get data from req.body
  // check if data present or not
  // if present then create the comment
  const {content} = req.body;
  const {videoId}=req.params;
  const owner=req.user?._id
  if ([content, videoId, owner].some((field) => field === "")) {
    throw new ApiError(402, "All field are required! ");
  }
 console.log(req.body);
 if(!isValidObjectId(videoId)){
  throw new ApiError(403," not the valid video Id");
 }
  const comment = await Comment.create({
    content,
    video:videoId,
    owner,
  });
  if (!comment) {
    throw new ApiError(501, " something went wrong while creating comment ");
  }

  return res.status(200).json(new ApiResponse(200, comment, " succesfully add comment "));
});

const getVideoComment = asyncHandler(async (req, res) => {
  // get the videoId  for comment and page or limit from res.query
  //aggregation pipeline for all comment  -> match the all comment wityh video id ->lookup with video model to get video an dthen owner name from owner id

  const { videoId } = req.params;
  const { page = 0, limit = 10 } = req.query;
 
  if(!isValidObjectId(videoId)){
    throw new ApiError(400," video id is required");
  }
 
  const comment =await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likedby",
        pipeline: [
          {
            $addFields: {
              likes: {
                $size: "$likedBy",
              },
            },
          },
        ],
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $skip: page * limit,
    },
    {
      $limit: limit*1,
    },

    {
      $project: {
        content: 1,
        owner: {
          fullName: 1,
          avatar: 1,
          userName: 1,
          _id: 1,
        },
        likes: { $ifNull: ["$likes", 0] },
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200,comment,"succesfully fetched the comment data"));
});

const deleteComment=asyncHandler(async(req,res)=>{
   //get comment id
   const {commentId}=req.params;
   if(!isValidObjectId(commentId)){
    throw new ApiError(401, "comment id is valid");
   }
  try {
    await Comment.deleteOne({ _id:new mongoose.Types.ObjectId(commentId)}); // if deleted then it return {acknowledged:true,deleted:1}
  } catch (error) {
    throw new ApiError(505," something went wrong while deleting your comment")
  }
  //  const isDeleted = await Comment.findByIdAndDelete(commnetId);

  return res.status(200).json( new ApiResponse(200,{},' your comment is successfully deleted'));
});

const updateComment=asyncHandler(async(req,res)=>{
  const {content}=req.body;
  const {commentId}=req.params;
  if(!content || !commentId){
    throw new ApiError(401," Content and Comment id both are required ");
  }
  const comment = await Comment.findById(commentId);
  if(!comment){
    throw new ApiError(400, " not valid comment Id")
  }
  comment.content=content;
  await comment.save({validateBeforeSave:true});
  
  // const comment =await Comment.findByIdAndUpdate(commentId,{
  //      $set:{
  //       content:content
  //      },
    //   {new:true}
  // })

  return res.status(200).json( new ApiResponse(200,comment,"comment updated successfully "));

})


export { 
  addComment ,
  getVideoComment,
  deleteComment,
  updateComment};
