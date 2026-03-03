import { Router } from "express";
import { 
  loginUser,
   registerUser, 
   logoutUser,
    refreshAccessToken, changeCurrentPassword, getCurrentUser, 
    getUserChannelProfile,
    getWatchHistory
  } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";







const router = Router();

router.route("/register").post(
  
  //going to use middleware here to 
    upload.fields([
    {
      name: "avatar",
      maxCount:1
    },
    {
      name: "coverImage",
      maxCount:1
    }

  ]),
//here
  
  registerUser
)




router.route("/login").post(loginUser)


//secure routes
router.route("/logout").post(verifyJWT, logoutUser)


router.route("/refresh-token").post(refreshAccessToken)


router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-accounts").patch(verifyJWT, updateAccountDetails)


router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single(cover-image),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)


export default router;


