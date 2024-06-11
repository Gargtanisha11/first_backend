//
import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const owner = req.user?._id;
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, "  name and description both are required ");
  }

  const createdPlaylist = await Playlist.create({
    name,
    owner,
    description,
  });
  if (!createdPlaylist) {
    throw new ApiError(502, " not able to create your playlist ");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, createdPlaylist, " your playlist  has been created")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
   const {userId} = req.params;
     const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, " successfully fetch the playlist")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.body;
  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: playlistId,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, " successfully fetch the playlist by id")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(402, " not a valid playlistid and videoId");
  }

  try {
    const updatePlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: {
          videos: {
            $push: videoId,
          },
        },
      },
      {
        new: true,
      }
    );
  } catch (error) {
     throw new ApiError( 500,error)
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylist,
        " successfully add the video in playlist "
      )
    );
});

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
     const {playlistId,videoId}= req.params;
     
     if( !isValidObjectId(playlistId)|| !isValidObjectId(videoId)){
      throw new ApiError(200," not a valid playlistid and videoId");
     }

     try {
      const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,{
       $set:{
         videos:{
           $pull:videoId
         }
       }
      },{
       new:true
      });
 
     } catch (error) {
       throw new ApiError( 500 , error)
     }
     return res.status(200).json( new ApiResponse(200, updatedPlaylist," successfully remove the video from playlist"));
});

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}= req.params;
    
    if(!isValidObjectId(playlistId)){
      throw new ApiError(403, " not valid playlist ");
    }

  try {
      const isDeleted= await Playlist.findByIdAndDelete(playlistId);
  } catch (error) {
     throw new ApiError( 502, error)
  }

    return res.status(200).json( new ApiResponse(200, isDeleted," successfully delete the playlist"))
})

const updatePlaylist=asyncHandler(async(req,re)=>{
   const {playlistId}= req.params;
   const {name,description} =req.body;
   if(!isValidObjectId(playlistId)){
    throw new ApiError(403, "not valid playlist ");
   }
   if(!(name || !description)){
    throw new ApiError(403," name or description required");
   }
   try {
     const playlist= await Playlist.findById(playlistId);
    if(name){
      playlist.name=name;
    }
    if(description){
     playlist.description= description;
    }
    playlist.save( {validateBeforeSave:true} );
   } catch (error) {
     throw new ApiError( 500, error);
   }
   const updatedPlaylist= await Playlist.findById(playlistId);

   return res.status(200).json( new ApiResponse(200, updatedPlaylist," successfully updated the playlist"))  ;  
})
export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
