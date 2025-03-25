
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import zxcvbn from "zxcvbn";
import validator from "validator";
import { Volunteer } from "../models/volunteer.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { Animal } from "../models/animal.js";

const generateAccessandRefreshTokens = async (userId) => {
    try {
        const volunteer = await Volunteer.findById(userId);
        if (!volunteer) {  // Important: Check if the user exists!
            throw new ApiError(404, "User not found"); // Or appropriate error
        }

        const accessToken = volunteer.generateAccessToken();
        const refreshToken = volunteer.generateRefreshToken();

        volunteer.refreshToken = refreshToken;
        await volunteer.save({ validateBeforeSave: false }); // Add await here!!!

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in generateAccessandRefreshTokens:", error); // Log for debugging
        throw new ApiError(500, "Token generation failed: " + error.message); // Re-throw
    }
}

const registerVolunteer = asyncHandler( async (req,res)=>{
    
    const {fullName, email, username, password, phone_number } = req.body

    if(!fullName || !email || !username || !password){
        throw new ApiError(400, "All feilds required while regitering")
    }

    const isEmailValid = validator.isEmail(email)
    if(!isEmailValid){
        throw new ApiError(400, "Enter a valid EmailId")
    }
    console.log(`${fullName}\n ${username}\n ${email}\n ${password}\n ${phone_number}`)

    const passwordResult = zxcvbn(password)
    console.log(`${passwordResult.score}`)
    if(passwordResult.score==1 || passwordResult.score==2){
        throw new ApiError(400, `${passwordResult.feedback}`)
    }


    const existedUser = await Volunteer.findOne({
        $or:[{username},{email}]
    })
    if(existedUser) {
        throw new ApiError(409, "User with email or username alredy exists")
    }
    console.log(req.files)

    let profileImageLocalPath;
    if(req.files && Array.isArray(req.files.profileImage) && req.files.profileImage.length > 0){
        profileImageLocalPath = req.files.profileImage[0].path
    }

    const profileImage = await uploadOnCloudinary(profileImageLocalPath)
    console.log("The profile image is :" , profileImage)

    const volunteer = await Volunteer.create({
        fullName,
        //avatar: avatar.url,
        profileImage: profileImage?.url || "",
        email,
        password,
        phone_number,
        username: username.toLowerCase()
    })



    const createdvolunteer = await Volunteer.findById(volunteer._id).select(
        "-password -refreshToken"
    )

    if(!createdvolunteer){
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdvolunteer, "User registered successfully")
    )
})

const loginVolunteer = asyncHandler( async (req,res)=>{
    const {email, username, password}  = req.body
    
    console.log(req.body)

    if (!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const volunteer = await Volunteer.findOne({
        $or: [{username}, {email}]
    })

    console.log(volunteer)

    if(!volunteer){
        throw new ApiError(400,"Register yourself first")
    }
    console.log(volunteer.password)
    if(password!=volunteer.password){
        throw new ApiError(400, "wrong password entered")
    }
    console.log(volunteer._id)

    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(volunteer._id)

    const loggedInUser = await Volunteer.findById(volunteer._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                volunteer: loggedInUser,accessToken,refreshToken
            },
            "Login Successfull"
        )
    )
})

const logoutVolunteer = asyncHandler(async(req,res)=> {
    await Volunteer.findByIdAndUpdate(
        req.volunteer._id,
        {
            $set: {
                refreshToken: undefined
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
    .json(new ApiResponse(200, {}, "User Logged out"))
})

const updatevolunteername = asyncHandler(async(req,res)=>{
    //console.log(req.body)
    const newUsername = req.body.newUsername

    if(!newUsername){
        throw new ApiError(400,"enter valid username")
    }

    const volunteer = await Volunteer.findByIdAndUpdate(
        req.body?._id,
        {
            $set:{
                username:newUsername
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, volunteer, "Username updated successfully"))
})

const updateFullNameVolunteer = asyncHandler(async(req,res)=>{
    //console.log(req.body)
    const newFullName = req.body.newFullName

    if(!newFullName){
        throw new ApiError(400,"enter valid username")
    }

    const volunteer = await Volunteer.findByIdAndUpdate(
        req.body?._id,
        {
            $set:{
                fullName:newFullName
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, volunteer, "Full Name updated successfully"))
})

var key=0
const forgotVolunteerPassword = asyncHandler(async (req,res)=>{  
    const reciever = Volunteer.findById(req.body?._id,)
    console.log(reciever)

    const sender = process.env.SENDER_EMAIL
    const senderpassword = process.env.GMAIL_APP_PASSWORD9
    const subject = "Forgot Password"
    key = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
    const description = `Enter this code to change your password ${key}`
    await sendEmail(sender,senderpassword,reciever,subject,description);

    return res.status(200).json(
        new ApiResponse(200, null, "Reset code sent to registered email")
    );
})

const verifyOTPforPasswordChangeVolunteer = asyncHandler(async (req,res)=>{
    const {otpverification} = req.body
    if(otpverification==key){
        return res.status(200).json(new ApiResponse(200,null,"OTP Verified Successfully"))
    }
    else throw new ApiError(400,"Wrong key entered")
})

const changeandupdateVolunteerPassword = asyncHandler(async (req,res)=>{
    const {newPassword} = req.body;
    const volunter = await Volunteer.findById(req.user?._id)
    volunter.password= newPassword
    await volunter.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,volunter,"Password updated"))
})


export {registerVolunteer,loginVolunteer, logoutVolunteer, updatevolunteername, updateFullNameVolunteer, forgotVolunteerPassword, verifyOTPforPasswordChangeVolunteer, changeandupdateVolunteerPassword}
