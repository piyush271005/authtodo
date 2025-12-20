import { ApiError } from "../utils/apiError.js";
import { asynchandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/users.models.js";


export const verifyJWT = asynchandler(async(req,__dirname, next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

       if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;/*This line attaches the authenticated 
        user object to the request lifecycle, 
        making user context globally accessible to all downstream middleware and route handlers.
        https://chatgpt.com/share/6944cd47-6aac-8000-9b00-552d1672b497*/
        next()
    }
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})