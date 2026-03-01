import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";






const registerUser = asyncHandler(async (req, res)=>{
 //get user details from frontend(postman)

const {fullname, email, password} = req.body;
console.log("email: ", email) //to check the data coming from frontend or not 



 //validation-not empty

 if(fullname===""){
  throw new APIError(400, "Fullname is required")
 }

 if(
  [email, password, fullname, username].some(()=>field?.trim()==="")
 ){
throw new APIError(400, "All fields are required and must not be empty")
 }




//check if user already exist in database: by username or email


// User.findOne({email: email})//ya ek check kr sakte ho ya pure me se koii bhi ek mil jaye toh niche wala method se check kr sakte ho

const existedUser = User.findOne({

  $or: [{username}, {email}]
})

if(existedUser){
  throw new APIError(409, "User already exist with this email or username")
}



  //check for images, chech for avatar
const avatarLocalPath= req.files?.avatar[0]?.path; //yeh path multer se aayega, multer ke storage me humne kaha hai ki file kaha save karni hai toh yeh path usi location ka dega jaha file save hui hai, aur yeh path hume cloudinary me upload karne ke liye chahiye hoga
const coverImageLocalPath= req.files?.coverImage[0]?.path; 
//if avatar localpath pe nhi hai
if(!avatarLocalPath){
  throw new APIError(400, "Avatar is required")
}


  //upload them to cloudinary, and check for avatar uploaded or not

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(avatar===null){
  throw new APIError(400, "Error while uploading avatar image/avatar image is required")
}







  // create user in database- create entry in DB
const user = await User.create({
  fullname,
  avatar:avatar.url, //cloudinary se aayega
  coverImage: coverImage?.url || "", //optional hai cover image, toh yeh tabhi save hoga jab cover image upload hoga cloudinary pe, agar nhi hua toh yeh null hi rhega
  email,
  password,
  username:username.toLowerCase().trim(), //username ko lowercase me convert kar diya aur trim bhi kar diya taki username ke aage ya peeche space na ho


})
//check user bana hai ya empty hi reh gya hai
 const createdUser = await User.findById(user._id).select("-password -refreshToken") //-ve sign matlab ye nhi chahiye response me, password aur refresh token ko response me nhi bhejna hai security ke liye, toh select me -password aur -refreshToken kar diya taki yeh dono field response me na aaye

 if(!createdUser){
  throw new APIError(500, "Something wen wrong while creating user")
 }




  //remove password and refesh token from response

  //check response came or not

  //return response

  return res.status(201).json(
    new APIResponse(201, "User created successfully", createdUser, "User registered successfully")
  )


})

export {registerUser, }