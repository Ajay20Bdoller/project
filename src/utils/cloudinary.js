import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


//jaha lage problem ho sakti hai vha try catch use kro


const uploadOnCloudinary = async (localFilePath)=>{

  try{ 
    if(!localFilePath) return null;

    //upload file on cloudinary
    const response= await cloudinary.uploader.upload(localFilePath, 
      {
        resource_type: "auto"
      })

    //file has been uploaded on cloudinary successfully
    // console.log("file has been uploaded on cloudinary successfully", response.url)
fs.unlinkSync(localFilePath)//remove the local save temporary file as we have already uploaded it on cloudinary and we dont need it in our local storage anymore

return response;





  } catch(error){
    fs.unlinkSync(localFilePath)//remove the local save temporary file as the operation got failed
    return null;

  }


}


export { uploadOnCloudinary }


