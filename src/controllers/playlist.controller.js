//
import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //  get the user, name , and description 
  const owner = req.user?._id;
  const { name, description } = req.body;

  // both  name and description are required  
  if (!name || !description) {
    throw new ApiError(400, "  name and description both are required ");
  }

  // creating playlist using create method of mongoose
  const createdPlaylist = await Playlist.create({
    name,
    owner,
    description,
  });

  // throw error if playlist not creating
  if (!createdPlaylist) {
    throw new ApiError(502, " not able to create your playlist ");
  }

  // returing the response
  return res
    .status(200)
    .json(
      new ApiResponse(200, createdPlaylist, " your playlist  has been created")
    );

});

const getUserPlaylists = asyncHandler(async (req, res) => {
  // get the userId
  const { userId } = req.params;

  // get the user playlist using aggregation pipeline 
  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "owner",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        owner: {
          userName: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);
  
  // returning the response
  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, " successfully fetch the playlist")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  // get the playlist Id
  const { playlistId } = req.params;

  // is playlist id valid or not 
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(403, " not a valid playlist id");
  }

  // get the playlist by id using aggregation pipeline
  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
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
  // get the playlist id an d video id from params ( /playlist/:videoId/:playlistId)
  const { playlistId, videoId } = req.params;

  // is playlistId and videoId  a valid id or not
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(402, " not a valid playlistid and videoId");
  }

  //get playlist by id
  const playlist= await Playlist.findById(playlistId);
  // get video by id
  const video = await Video.findById(videoId);

  // only owner of the playlist have access to add playlist
  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(400, " don,t have access to add playlist ");
  }

  // only access to add video of same owner as the playlist owner
  if (!playlist.owner.equals(video.owner)) {
    throw new ApiError(400, " not allowed to add other video in your playlist");
  }

  // add the video in videos field
  try {
      // chcek if video is not already present in playlist
      
      if( playlist.videos.includes(videoId)) {
      throw new ApiError(400, " already added the video")
      }


    const updatePlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: {
          videos: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatePlaylist,
          " successfully add the video in playlist "
        )
      );
  } catch (error) {
    throw new ApiError(500, error);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // get the playlist id and video id from params ( /playlist/:videoId/:playlistId)
  const { playlistId, videoId } = req.params;

  // is playlistId and videoId  valid id or not
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(200, " not a valid playlistid and videoId");
  }
  // get playlist  from playlist id
  const { owner } = await Playlist.findById(playlistId);

  // only owner of the playlist have the access to delete the video from playlist
  if (!owner.equals(req.user._id)) {
    throw new ApiError(400, " don,t have access to delete playlist ");
  }

  // deleting the video
  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          " successfully remove the video from playlist"
        )
      );
  } catch (error) {
    throw new ApiError(500, error);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // get the playlist id from params
  const { playlistId } = req.params;

  // is the playlist valid or not
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(403, " not valid playlist ");
  }

  // get the owner of the playlist
  const { owner } = await Playlist.findById(playlistId);

  // owner the playlist have access to delete the playlist
  if (!owner.equals(req.user._id)) {
    throw new ApiError(400, " don't have access to delete playlist ");
  }

  // deleting the playlist
  try {
    const isDeleted = await Playlist.findByIdAndDelete(playlistId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, isDeleted, " successfully delete the playlist")
      );
  } catch (error) {
    throw new ApiError(502, error);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  // get the playlist id  and name and description for updating
  const { playlistId } = req.params;
  const { name, description } = req.body;

  // is playlistId valid or not
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(403, "not valid playlist ");
  }

  // get the owner of the playlist
  const playlist = await Playlist.findById(playlistId);

  // playlist owner have only access to update the playlist
  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(400, " don,t have access to delete playlist ");
  }

  // if both name and description not sending by user then throw error
  if (!(name || !description)) {
    throw new ApiError(403, " name or description required");
  }

  // updating the playlist
  try {
    // name of the playlistchange
    if (name) {
      playlist.name = name;
    }

    // description of the playlist change
    if (description) {
      playlist.description = description;
    }

    // save the changes
    playlist.save({ validateBeforeSave: true });

    const updatedPlaylist = await Playlist.findById(playlistId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedPlaylist,
          " successfully updated the playlist"
        )
      );
  } catch (error) {
    throw new ApiError(500, error);
  }
});
export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
