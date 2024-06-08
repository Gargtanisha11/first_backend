import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import { options } from "../constant.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenRefreshToken = async (user_id) => {
  // there can be error because i pass whole object

  try {
    const user = await User.findById(user_id);
    const accessToken = await user.generateAccessToken(); // generate access Token
    const refreshToken = await user.generateRefreshToken(); //generate refresh token

    user.refreshToken = refreshToken; // change the value of refresh token in user
    await user.save({ validateBeforeSave: false }); // save the user with refresh token their is no need to validate

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      " something went wrong while generating access and refresh token - " +
        error
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //logic for register
  //step 1 - get user details from front end
  //step 2 - validation check - not empty etc
  //step 3 - check if user already existed or not
  //step 4 - check for cover image and check for avatar
  //step 5 - uplaod them to cloudinary
  //step 6 - create user object and add in db
  //step 7 - remove password and refresh token field from response  after creating using object
  //step 8 - check for user creation
  //step 9 - return res

  const { fullName, email, password, userName } = req.body; // step 1 we take data from user using postman in json format

  console.log("full name ", req.body);
  if (fullName == "") {
    throw new ApiError(400, "all fields are neccessary "); // step 2
  }

  if (
    [fullName, email, userName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(404, " all fields are neccessary "); // step 2 this is how you can check all field are empty or not using some method it return true if any elemant of array is trigger with if condition
  }

  //step3  check if user already existed or not   ( we take user  from user model which have the access of mongoose and we can check any field's existence by using find method )
  //  User.findOne(email)  is used for check one field at a time

  const existedUser = await User.findOne({ $or: [{ email }, { userName }] });

  if (existedUser) {
    fs.unlinkSync(req.files?.avatar[0]?.path);
    fs.unlinkSync(req.files?.coverImage[0]?.path);
    throw new ApiError(409, " User already existed ");
  }

  // multer give access for res.files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  // check that avatar is uploaded or not
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required ");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, " unable to upload on cloudinary");
  }

  // create user in mongoose
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,
  });

  // whenever mongoose  a user register it create an id with it  with the name _ID  you  can access taht id by findById
  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken "
  );

  //  check for creation of user
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user  "
    ); // 500 code because it is server side error
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body= data
  // userName or email
  // find the user
  // check the password
  // if yes  access and refresh Token
  // send cookie

  const { email, userName, password } = req.body;

  if (!(email || userName)) {
    throw new ApiError(404, "userName or email is required ");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, " Not found this ", { email }, "or ", { userName });
  }

  const isValidUser = await user.isPasswordCorrect(password);

  if (!isValidUser) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        " user succesfully logged in"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // logout means we delete refresh Token from cookie and user data
  // for refresh token we need to check first is user logged in or not
  // to get  refresh token  we want user data and for it we create an custom middleware to verify jwt (middleware  is like a softwaare wich acts intemediate between two services )
  // by doing req.user = user in  middleware  (we get access of req.user)
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, " SuccessFul LogOut "));
});

const refreshAcessToken = asyncHandler(async (req, res) => {
  //step1  take the user refresh token  from user cookie or body
  //step2  decode the id from it
  //step3  find the user by id and then match is the refresh Token is same or not
  //step4 is it same then generate the access Token and refresh token
  // step5 return the status cookies and json

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(404, " unauthorized request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const { accessToken, newRefreshToken } =
    await generateAccessTokenRefreshToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(200, {
        accessToken,
        refreshToken: newRefreshToken,
      })
    );
});

const changeOldPassword = asyncHandler(async (req, res) => {
  // take the old password and new password
  //  the fetch the user data from User model  using req.user._id beacause of auth middlware
  //   change the  password  and then save it without saving it doesn't reflect
  const { oldPassword, newPassword } = req.body;
  // suppose we also get the confirmPassword first we destructure it and then we validate that is it equal or not using if condition

  if (!(oldPassword && newPassword)) {
    throw new ApiError(404, "password are required ");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "unauthorized access");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "unauthorized access");
  }
  user.password = newPassword;

  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, " succesfully change your password"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "current user data fetched successfully ")
    );
});

// Suggestion : we should keep separate end point to update files
// quetions : should we check the authentication before updating the account details -  this will we take care at the time of routing
const updateAccountdetails = asyncHandler(async (req, res) => {
  // take the data which user want to update  from req.body
  // check if user has send the details or not
  // get the user form find by id and also we can use findByIdAndUpdate for changing the details
  // change the detail and then save it

  const { fullName, email } = req.body;
  if (!(fullName || email)) {
    throw new ApiError(402, " All Field Required");
  }
  const user = await User.findById(req.user._id);
  if (fullName) {
    user.fullName = fullName;
  }
  if (email) {
    user.email = email;
  }
  user.save({ validateBeforeSave: true });

  // const user = User.findByIdAndUpdate(
  //   req.user?._id,
  //   {
  //     $set: {
  //       fullName: fullName,
  //       email: email,
  //     },
  //   },
  //   { new: true }
  // ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, [], "Account details updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // take the file using multer in routing
  // check is file not sending by user or not
  // save in local and  upload on cloudinary using storage from multer middleware
  // save the link in user data base using findbyidandupdatemethod
  // delete the old file link from cloudinary using custom method of cloudnary.js

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(402, " avatar field required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(
      501,
      " something went wrong while uploading the file on server"
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  const isDeleted = await deleteFromCloudinary(req.user?.avatar);

  if (!isDeleted) {
    throw new ApiError(401, " file is not deleted errro is ", isDeleted);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, " avatar file updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  // take the local path of the file
  // check  if it there
  // upload the file on cloudinary
  // use findByIdandUpdate to update it
  // delete the file from cloudinary
  // return the response

  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath) {
    throw new ApiError(402, " it is required to upload the coverImage file");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, " Unable to upload coverImage on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  );
  if (req.user?.coverImage) {
    const isDeleted = deleteFromCloudinary(req.user?.coverImage);

    if (!isDeleted) {
      throw new ApiError(
        500,
        " unable to delete the coverimage file from cloudinary"
      );
    }
  }



  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "coverImage file updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // controller for see the other Channel profile

  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiResponse(401, " username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        userName: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribers",
      },
    },
    
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false,
        },
        },
      },
    }, 
    {
      $project: {
        fullName: 1,
        userName: 1,
        email: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        createdAt: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(401, "channel doesn't exist ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user channel fetched successfully")
    );
});


const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                    userName: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner", // ArrayElemat:["$owner",0]
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        " successfully fetched the watch history"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAcessToken,
  changeOldPassword,
  getCurrentUser,
  updateAccountdetails,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
