import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema(
  {

    videoFile:{
      type: String, //claudinary url
      required:true,
      trim:true,

    },

    thumbnail: {
      type:String, //claudinary url
      required:true,
      trim:true,  
    },
     tittle:{
      type: String,
      required:true,
      trim:true,  
    },

    description: {
      type: String,
      required:true,
      trim:true,
    },

    duration:{
      type:Number,//  duration in seconds//comes from claudinary url 
      required:true,

    },

    viewa:{
      type:Number,
      default:0,
    },

    isPublished:{
      type:Boolean,
      default:true,
    },
    owner:{
      type: Schema.Types.ObjectId,
      ref: "User",
    }
    



}, {timestamps:true})


videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);