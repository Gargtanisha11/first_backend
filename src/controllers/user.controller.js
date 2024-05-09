import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

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

  res.status(200).json({
    message: "ok",
  });
  const { fullName, email, password, userName } = req.body;
  console.log(`this is email of user ${email} \n this is username ${userName}`); // step 1 we take data from user using postman in json format

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
     const existedUser = User.findOne({ $or: [{ email }, { userName }] });
     if (existedUser) {
        throw new ApiError(409, " User already existed ");
     }
 // console.log(existedUser)
   // multer give access for res.files 
    

});

export { registerUser };
