import { Router } from "express";
 import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    getCurrentUserTasks,
    isLoggedIn
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)


router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/get-current-tasks").get(verifyJWT,getCurrentUserTasks)
router.route("/isauth").get(verifyJWT,isLoggedIn)


export default router

