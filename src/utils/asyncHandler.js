// what we are doing here?
// Async fun me jistne bhi error aane wale hai sabko yhi pe handle karenge
// ->async function me error aata hai await wale line and vhi async route bhi hote hai se like = await fs.readFile("data.txt", "utf-8") 




const asyncHandler = (requestHandler) => {


  (req, res, next)=>{
    Promise.resolve(requestHandler(req, res, next))
    .catch(err => next(err))

  }
}
export { asyncHandler}  

//rapar fn bana rhe hai jo har ek route ke liye use hoga taki har ek route me try catch na likhna pade aur error handling ek jaisi ho jaye BY TRY CATCH METHOD  


// method-01
// const asyncHandler = (fn) => async (req, res, next) => {
// try {
//   await fn(req,res,next)

//   } catch (error) {

//   res.status(error.code || 500).json({
//     success: false,
//     message: error.message
//   })
//   }
// }
