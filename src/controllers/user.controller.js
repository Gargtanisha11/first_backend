import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";

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

  const { fullName, email, password, userName } = req.body;
  console.log(`this is email of user ${email} \n this is username ${userName}`); // step 1 we take data from user using postman in json format


  console.log(req.files)

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
  // console.log(existedUser)
  if (existedUser) {
     fs.unlinkSync(req.files?.avatar[0]?.path);
     fs.unlinkSync(req.files?.coverImage[0]?.path)
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

export { registerUser };
