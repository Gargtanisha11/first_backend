import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema= new Schema({
    vidoeFile:{
        type:String, //cloundary Url
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        required:true,
    },
    isPublished:{
        type:Boolean,
        required:true,
    },
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video=new mongoose.model("Video",videoSchema);
