import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { Volunteer } from "../models/volunteer.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Auhtorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const volunteer = await Volunteer.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!volunteer){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.volunteer = volunteer;
        next()
    } 
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token" )
    }
}) 
