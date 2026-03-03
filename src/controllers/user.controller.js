import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";



const generateAccessAndRefreshTokens = async (userId) => {
  try {
    
const user = await User.findById(userId)
const accessToken= user.generateAccessToken()
const refreshToken = user.generateRefreshToken()


user.refreshToken = refreshToken
await user.save({validateBeforeSave: false})

return {accessToken, refreshToken }



  } catch (error) {
    throw new APIError(500, "something went wrong while generating refresh and access token")
    
  }
}










//register*************///////
const registerUser = asyncHandler(async (req, res)=>{
 //get user details from frontend(postman)

const {fullname, email, password, username} = req.body;
console.log("email: ", email) //to check the data coming from frontend or not 



 //validation-kahi empty toh nhi reh gya

 if(fullname===""){
  throw new APIError(400, "Fullname is required")
 }

 if(
  [email, password, fullname, username].some((field)=> field?.trim()==="")
 ){
throw new APIError(400, "All fields are required and must not be empty")
 }




//check if user already exist in database: by username or email


// User.findOne({email: email})//ya ek check kr sakte ho ya pure me se koii bhi ek mil jaye toh niche wala method se check kr sakte ho

const existedUser = await User.findOne({

  $or: [{username}, {email}]
})

if(existedUser){
  throw new APIError(409, "User already exist with this email or username")
}

// console.log(req.files);

  //check for images, chech for avatar
const avatarLocalPath= req.files?.avatar[0]?.path; //yeh path multer se aayega, multer ke storage me humne kaha hai ki file kaha save karni hai toh yeh path usi location ka dega jaha file save hui hai, aur yeh path hume cloudinary me upload karne ke liye chahiye hoga

//method-1 for coverImage
// const coverImageLocalPath= req.files?.coverImage[0]?.path; 
// method-2 for coverImage
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  coverImageLocalPath = req.files.coverImage[0].path
}





//if avatar localpath pe nhi hai
if(!avatarLocalPath){
  throw new APIError(400, "Avatar is required")
}


  //upload them to cloudinary, and check for avatar uploaded or not

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
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

//LOGIN USER********////////////
const loginUser = asyncHandler(async(req, res)=> {
//req body se data get karo
   const {email, password, username} = req.body;

   if(!(username || email)){
    throw new APIError(400, "Username or email is required")
   }

   

//username ya email se user ko database me dhundo
const user = await User.findOne({
  $or : [{username}, {email}]
})


//find user by email or username
if(!user){
  throw new APIError(404, "User not found with this email or username")
}

//password check
const isPasswordValid = await user.isPasswordMatch(password)

if(!isPasswordValid){
  throw new APIError(401, "Invalid user credentials")
}


//access and refresh token generate karo



const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)



//send in secure cookie
 const loggedInUser= await User.findById(user._id).
 select("-password -refreshToken")

 const options ={
  httpOnly: true,
  secure: true
 }//only server se modify hoga not from frontend

 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .json(
  new APIResponse(
    200,{
      user:loggedInUser, accessToken, refreshToken
    },
    "user logged In successfully"
  )
 )

//send res


})
//LONGOUTuser**********////////

const logoutUser = asyncHandler(async(req, res)=>{
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined

      }
    },
    {
      new: true
    }
  )

  const options ={
  httpOnly: true,
  secure: true
 }

 return res
 .status(200)
 .clearCookie("accessToken", options)
 .clearCookie("refreshToken", options)
 .json(new APIResponse(200, {}, "User logged Out"))

})

//PROPER ACCESS AND REFRESH TOKEN
const refreshAccessToken= asyncHandler(async (req, res)=>{
  const incomingRefreshToken = req.cookies.
  refreshToken || req.body.refreshToken

if(!incomingRefreshToken){
  throw new APIError(401, "unauthorized req")
}

//varify
try {
  const decodedToken= Jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  
  const user= await User.findById(decodedToken?._id)
  if(!user){
    throw new APIError(401, "Invalid refresh token")
  }
  
  if(incomingRefreshToken !==user?.refreshToken){
    throw new APIError(401, "Refresh token is expired or used")
  }
  
  const options = {
    httpOnly: true,
    secure: true
  }
  
  const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken",newRefreshToken ,options)
  .json(
    new APIResponse(200,
      {accessToken, refreshToken:newRefreshToken},
      "Access token refreshed"
    )
  )
  
} catch (error) {
  throw new APIError(401, error?.message || "Invalid refresh token");
  
}

})


const changeCurrentPassword = asyncHandler(async(req, res)=>{

  const {oldPassword, newPassword, confPassword}= req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new APIError (400,"Invalid old password")
  }
user.password=newPassword
await user.save({validateBeforeSave: false})

return res.status(200).
json(new APIResponse(200, {}, "password changed successfully"))

if(!(newPassword==confPassword)){
  throw new APIError (400,"pass not same")
}

})

const getCurrentUser = asyncHandler(async(req, resp)=>{
return res
.status(200)
.json(200, req.user, "current user fetched successfully")

})

//user kya kya update kr sakta hai ye hum hi decide krte hai backend me
const updateAccountDetails = asyncHandler(async(req, res)=>{
  const {fullname, email}= req.body
if(!(fullname || email)){
  throw new APIError(400, "All field are required")
}
const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      fullname,
      email:email
    }
  },{
    new:true
  }
).select("-password")

return res
.status(200)
.json(new APIResponse(200, user, "Account details updated successfully"))

})

//FILES UPDATE- through multer, vhi kr payega jo logging ho 
const updateUserAvatar = asyncHandler(async(req, res)=>{
const avatarLocalPath = req.file?.path

if(!avatarLocalPath){
  throw new APIError(400, "avater files is missing")
}
const avatar = await uploadOnCloudinary(avatarLocalPath)

if(!avatar.url){
  throw new APIError(400, "Error while uploading on avatar")
  
}
const user =  await User.findByIdAndUpdate(req.user?._id,
  {
$set :{
  avatar: avatar.url
}

  },
  {new: true}
 ).select("-password")

 return res
.status(200)
.json(
  new APIResponse(200, user, "avatar updated successfully")
)

})

const updateUserCoverImage = asyncHandler(async(req, res)=>{
const coverImageLocalPath = req.file?.path

if(!coverImageLocalPath){
  throw new APIError(400, "coverImage files is missing")
}
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!coverImage.url){
  throw new APIError(400, "Error while uploading on coverImage")
  
}
 const user = await User.findByIdAndUpdate(req.user?._id,
  {
$set :{
  coverImage: coverImage.url
}

  },
  {new: true}
 ).select("-password")

return res
.status(200)
.json(
  new APIResponse(200, user, "Cover Image updated successfully")
)

})



export {registerUser,
   loginUser, 
   logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    



}

