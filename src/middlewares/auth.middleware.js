// this is for verify authorization

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const verifyJWT=asyncHandler(async(req,_,next)=>{ // if some argument is not used in our code then we can use _ in that place 
    
    // take refreshToken from cookies or from header and verify that is it valid token or not our app have access of cookies by this (app.use(cookie_parser()))
    // step 1 : Get the refreshtoken 
    // step 2 : Verify the token using verify method of jwt 
    // step 3 : Get the user data by method findById using decodedToken?._id (in our decoded Token we have all thing that we give on genetaring time ) 
   try {
     const accessToken=  req.cookies?.accessToken ||  req.header("Authorization")?.replace("Bearer ","")

     if(!accessToken){
       throw new ApiError(401," Unauthorization Request ")
     }

    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)  // it return decode object 

    const user = await User.findById(decodedToken?._id).select(" -refreshtoken -password ")

    if(!user){
        // NEXT_VDO: disscuss about frontEnd
         throw new ApiError(401,"Invalid Access token")
    }
 
    req.user=user;
    next() // then it goes to logoutUser method 
   

   } catch (error) {
     throw new ApiError(400," SomeThing Went Wrong"+"  "+error)
     // something is going wrong 
    
   }

})