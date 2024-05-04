import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
// this code is suppose that the file which is uplaod by user is saved locally on server we try to uplaod it on cloudinary 
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    cloudinary.uploader.upload(
      "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
      { public_id: "olympic_flag" },
      function (error, result) {
        console.log(result);
        console.log(result.url)
      }
    );
  } catch (error) {
    fs.unlinkSync(localFilePath)
  }
};
