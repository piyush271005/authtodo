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
        secure: true,
        sameSite: "none" ,
        path: "/"
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
        secure: true,
        sameSite: "none" ,
        path: "/"
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))


    })

   const refreshAccessToken = async (req, res) => {
  try {
    
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    
    const decoded = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

   
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    
    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({ message: "Refresh token expired or reused" });
    }

   
    const newAccessToken = user.generateAccessToken();

    
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none" ,
        path: "/"
        
      })
      .json({
        success: true,
        message: "Access token refreshed",
      });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};

      

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

const isLoggedIn = (req, res) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }


    

    const isLoggedIn = (req, res) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // optional: attach user to request for downstream usage
    req.user = decoded;

    return res.status(200).json({ authenticated: true });

  } catch (error) {
    return res.status(401).json({ authenticated: false });
  }
};

    return res.status(200).json({ authenticated: true });

  } catch (error) {
    return res.status(401).json({ authenticated: false });
  }
};





export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    getCurrentUserTasks,
    isLoggedIn

}




