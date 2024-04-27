import mongoose, { Schema } from "mongoose";

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

    fullName:{
      type:String,
      required:true,
    },
     avatar:{
        type:String,
        required: true, // cloundnary url
     },
    coverImage:{
        type:String,
        
     },
     password:{
        type:String,
        required: true, // cloundnary url
     },
     refreshToken:{
        type:String,
     },
     watchHistory:{
        type:Schema.Types.ObjectId,
        ref:"Video",
     }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
