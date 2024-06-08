import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { getPublicIdFromCloudinaryUrl } from "./helperFun.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

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


const deleteFromCloudinary=async(url)=>{
  try{
    if(!url) return null;
    const publicId=getPublicIdFromCloudinaryUrl(url);
    
    if(!publicId){
      return null;
    }
    const response=await cloudinary.uploader.destroy(publicId);   
    return response;
  }
  catch(error){
    
    return error;
  }
}
export {uploadOnCloudinary,deleteFromCloudinary};
