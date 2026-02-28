import express from 'express';
import cors from "cors";
import cookiesParser from "cookie-parser";  //to read cookies from request header OR use in CRUD operations




const app =express();

app.use(cors({
origin: process.env.CORS_ORIGIN,
credentials: true //
 }))




 app.use(express.json({
  limit: "1mb"
 }))


 app.use(express.urlencoded({
  extended: true,//object ke under object ya array ke under array de sakte hai
  limit: "1mb"
 })) 

 
app.use(express.static("public"))


app.use(cookiesParser())



export { app }