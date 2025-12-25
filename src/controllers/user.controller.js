import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.models.js";
import  Jwt  from "jsonwebtoken";
import mongoose from "mongoose";
import { Tasks } from "../models/task.model.js";


const generateAccessAndRefreshTokens = async(userId)=>{
    try{

        const user = await User.findById(userId)
        if (!user) {
    throw new ApiError(404, "User not found while generating tokens")
}

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken=refreshToken

        await user.save({ validateBeforeSave: false })

        return {accessToken,refreshToken}







    }

    catch(error){

        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }

    
}

const registerUser = asynchandler(async (req, res) => {
   

    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});







    const loginUser = asynchandler(async(req,res)=>{
        const {email,username,password}= req.body
        
        if(!username && !email){
            throw new ApiError(400, "username or email is required")
        }

        const user = await User.findOne({
            $or: [{username},{email}]
        })
        if(!user){
            throw new ApiError(404, "user doesn't exist")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)
        if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
    httpOnly: true,
    secure: true
}

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser, accessToken , refreshToken
            },
            "user logged In sucessfully"
        
        )
    )


    })


    const logoutUser = asynchandler(async(req,res)=>{
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))


    })

   const refreshAccessToken = asynchandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = Jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token expired or reused");
        }

        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        console.error("REFRESH ERROR:", error);
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});

    const getCurrentUser = asynchandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const getCurrentUserTasks = async (req, res) => {
  const userId = req.user._id;

  const tasks = await Tasks.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    tasks,
  });
};



export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    getCurrentUserTasks

}




