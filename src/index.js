import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";


dotenv.config({
  path: './env'
})

connectDB()

//below steps for after database connection(video custom api and eror handling for express app)
.then( ()=>{
  
   app.on("error", (error)=>{
      console.log("ERROR:", error);
      throw error
   })
  app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running at port ${process.env.PORT}`)
  })



})
.catch((error)=>{
  console.log("DB connection failed !!! ", error)
  process.exit(1)
})




















// #first prroach
// use async if for DB in different continent 
// 
/*

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

import express from "express";
const app= express();

;(async()=>{
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log("DB connected successfully")
    
    //now we well be going to write ablout express app error handling
    app.on("error", (error)=>{
      console.log("ERROR:", error);
      throw error 

    })//listen
app.listen(process.env.PORT, ()=>{
  console.log(`Server is listing on port ${process.env.PORT}`)
})

  } catch (error) {
    console.log("ERROR: ", error)
    throw error
    
  }
})();

*/

