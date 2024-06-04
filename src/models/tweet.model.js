import mongoose, { Schema } from "mongoose";

const tweetSchema=new Schema({
    content:{
        type:String,
        required:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

},{timestamp:true});

export const Tweet= new mongoose.model("Tweet",tweetSchema);