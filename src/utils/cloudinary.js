import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError";
import { getPublicIdFromCloudinaryUrl } from "./helperFun";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
// this code is suppose that the file which is uplaod by user is saved locally on server we try to uplaod it on cloudinary 
// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto"
//     });
//     fs.unlinkSync(localFilePath)
//     return response;
     
    
//   } catch (error) {
//     fs.unlinkSync(localFilePath)
//     return error;
//   }
// };
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    }); // Added missing closing parenthesis here
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return error;
  }
};


const deleteFromCloudinary=async(localFilePath)=>{
  try{
    if(!localFilePath) return null;
    const publicId=getPublicIdFromCloudinaryUrl(localFilePath);
    if(!publicId){
      throw new ApiError(401,"not ifmd Public Id");
    }
   

    const response=await cloudinary.uploader.destroy(publicId,()=>console.log("deleted"));

    fs.unlinkSync(localFilePath)
    return response;
  }
  catch(error){
    fs.unlinkSync(localFilePath);
    return error;
  }
}
export {uploadOnCloudinary,deleteFromCloudinary};
