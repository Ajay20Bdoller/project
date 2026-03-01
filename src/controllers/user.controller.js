import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res)=>{
 //get user details from frontend(postman)


 

 //validation-not empty

  //check if user already exist in database: by username or email

  //check for images, chech for avatar

  //upload them to cloudinary, and check for avatar uploaded or not

  // create user in database- create entry in DB

  //remove password and refesh token from response

  //check response came or not

  //return response
})

export {registerUser}