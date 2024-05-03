import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken0";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true, //for making a field searchable optimizie
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true, // cloundnary url
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: true, // cloundnary url
    },
    refreshToken: {
      type: String,
    },
    watchHistory: [
      {
        // array of video
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified(this.password)) {
    retrun;
  }
  this.password = bcrypt.hash(this.password, 10);
  next();
});   // code for hashing the password for saving


userSchema.methods.isPasswordCorrect=async function(password){
      return await bcrypt.compare(password,this.password)  // this is time taking process that why we use async await here

}    // this is custom method for check the password is match with save password using bcrypt.compare(npm package) method


userSchema.methods.generateAccessToken=function(){
  jwt.sign({     //sign method for generating the acc
       _id:this._id,
       email:this.email,
       userName:this.userName,
       fullName:this.fullName,
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
   expiresIn: process.env.ACCESS_TOKEN_EXPIRY // if it takes time that we use async and await to handle it 
  }
)
}// this method for generating access token  

userSchema.methods.generateRefreshToken=function(){
   jwt.sign({     //sign method for generating the acc
      _id:this._id,
      
 },
 process.env.REFRESH_TOKEN_SECRET,
 {
  expiresIn: process.env.REFRESH_TOKEN_EXPIRY // if it takes time that we use async and await to handle it 
 })

}// this method for generating refresh token 

export const User = mongoose.model("User", userSchema);
