import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


const userSchema = new Schema(
  
  {
username: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  index: true,
},

email: {
  type: String,
  required:true,
  unique: true,
  lowercase: true,
  trim:true,

},

fullname: {
  type:String,
  required: true,
  trim: true,
  index:true,

},

avatar: {
  type: String, //we use claudinary url to store the avatar and it will return a url
  required: true,
  trim: true,

},

coverimage:{
  type: String, //we use claudinary url to store the coverimage and it will return a url

},

watchHistory: {//isme multiple value rahenge thats why its an array 
  type: Schema.Types.ObjectId,
  ref: " Video",



},

// watchLater:{


// },
password: {
  type:String,
  required:[true, "Please provide a password"],

},

refeshToken:{
  type: String,

}








}, {timestamps:true})


//going to use pre HOOK to hash the password before saving it to the database
userSchema.pre("save" , async function (next){
  if(!this.isModified("password")) return next();

  this.password = bcrypt.hash(this.password, 10);
  next()
})

userSchema.methods.isPasswordMatch = async function (password){
   return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullname: this.fullname,
  },//ek toh payload hai and dusra DB se aa rha hai like this.-id, etc
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  }
)
}
userSchema.methods.generateRefreshToken = function(){
 return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullname: this.fullname,
  },//ek toh payload hai and dusra DB se aa rha hai like this.-id, etc
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  }
)

} 


export const User = mongoose.model('User', userSchema);