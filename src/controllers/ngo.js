
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import zxcvbn from "zxcvbn";
import validator from "validator";
import { NGO } from "../models/ngo.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessandRefreshTokens = async (userId) => {
    try {
        const ngo = await NGO.findById(userId);
        if (!ngo) {  // Important: Check if the user exists!
            throw new ApiError(404, "User not found"); // Or appropriate error
        }

        const accessToken = ngo.generateAccessToken();
        const refreshToken = ngo.generateRefreshToken();

        ngo.refreshToken = refreshToken;
        await ngo.save({ validateBeforeSave: false }); // Add await here!!!

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in generateAccessandRefreshTokens:", error); // Log for debugging
        throw new ApiError(500, "Token generation failed: " + error.message); // Re-throw
    }
}

const registerNGO = asyncHandler( async (req,res)=>{
    
    const {uniqueIdentificationNumber, email, fullName, password, phone_number } = req.body

    if(!fullName || !email || !uniqueIdentificationNumber || !password){
        throw new ApiError(400, "All feilds required while regitering")
    }

    const isEmailValid = validator.isEmail(email)
    if(!isEmailValid){
        throw new ApiError(400, "Enter a valid EmailId")
    }
    console.log(`${fullName}\n ${uniqueIdentificationNumber}\n ${email}\n ${password}`)

    const passwordResult = zxcvbn(password)
    console.log(`${passwordResult.score}`)
    if(passwordResult.score==1 || passwordResult.score==2){
        throw new ApiError(400, `${passwordResult.feedback}`)
    }


    const existedUser = await NGO.findOne({
        $or:[{username},{email}]
    })
    if(existedUser) {
        throw new ApiError(409, "User with email or username alredy exists")
    }
    console.log(req.files)
    //const avatarLocalPath = req.files?.avatar[0]?.path;
    //console.log("The avatar is :" , avatarLocalPath)
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let profileImageLocalPath;
    if(req.files && Array.isArray(req.files.profileImage) && req.files.profileImage.length > 0){
        profileImageLocalPath = req.files.profileImage[0].path
    }

    //const avatar = await uploadOnCloudinary(avatarLocalPath)

    const profileImage = await uploadOnCloudinary(profileImageLocalPath)
    console.log("The profile image is :" , profileImage)

    // if(!avatar){
    //     throw new ApiError(400,"Avatar file is required")
    // }

    const ngo = await NGO.create({
        fullName,
        //avatar: avatar.url,
        profileImage: profileImage?.url || "",
        email,
        phone_number,
        password,
        uniqueIdentificationNumber
    })



    const createdngo = await NGO.findById(ngo._id).select(
        "-password -refreshToken"
    )

    if(!createdngo){
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdngo, "User registered successfully")
    )
})

const loginNGO = asyncHandler( async (req,res)=>{
    const {email, uniqueIdentificationNumber, password}  = req.body
    
    console.log(req.body)

    if (!(uniqueIdentificationNumber || email)){
        throw new ApiError(400, "username or email is required")
    }

    const ngo = await NGO.findOne({
        $or: [{username}, {email}]
    })

    console.log(ngo)

    if(!ngo){
        throw new ApiError(400,"Register yourself first")
    }
    console.log(ngo.password)
    if(password!=ngo.password){
        throw new ApiError(400, "wrong password entered")
    }
    console.log(ngo._id)

    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(ngo._id)

    const loggedInUser = await NGO.findById(ngo._id).select("-password -refreshToken")

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
                ngo: loggedInUser,accessToken,refreshToken
            },
            "Login Successfull"
        )
    )
})


const logoutNGO = asyncHandler(async(req,res)=> {
    await NGO.findByIdAndUpdate(
        req.ngo._id,
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

// const updateUniqueIdentificationNumbe = asyncHandler(async(req,res)=>{
//     //console.log(req.body)
//     const newUniqueIdentificationNumber = req.body.newUniqueIdentificationNumber

//     if(!newUniqueIdentificationNumber){
//         throw new ApiError(400,"enter valid username")
//     }

//     const ngo = await NGO.findByIdAndUpdate(
//         req.body?._id,
//         {
//             $set:{
//                 uniqueIdentificationNumber:newUniqueIdentificationNumber
//             }
//         },
//         {new:true}
//     ).select("-password")

//     return res
//     .status(200)
//     .json(new ApiResponse(200, ngo, "Username updated successfully"))
// })

const updateFullNameNGO = asyncHandler(async(req,res)=>{
    //console.log(req.body)
    const newFullName = req.body.newFullName

    if(!newFullName){
        throw new ApiError(400,"enter valid username")
    }

    const ngo = await NGO.findByIdAndUpdate(
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
    .json(new ApiResponse(200, ngo, "Full Name updated successfully"))
})

var keyNGO=0
const forgotPasswordNGO = asyncHandler(async (req,res)=>{  
    const reciever = NGO.findById(req.ngo?._id,)
    console.log(reciever)
    const recieverEmail = reciever.email
    const sender = process.env.SENDER_EMAIL
    const senderpassword = process.env.GMAIL_APP_PASSWORD9
    const subject = "Forgot Password"
    keyNGO = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
    const description = `Enter this code to change your password ${keyNGO}`
    await sendEmail(sender,senderpassword,recieverEmail,subject,description);

    return res.status(200).json(
        new ApiResponse(200, null, "Reset code sent to registered email")
    );
})

const verifyOTPforPasswordChangeNGO = asyncHandler(async (req,res)=>{
    const {otpverification} = req.body
    if(otpverification==keyNGO){
        return res.status(200).json(new ApiResponse(200,null,"OTP Verified Successfully"))
    }
    else throw new ApiError(400,"Wrong key entered")
})

const changeandupdatePasswordNGO = asyncHandler(async (req,res)=>{
    const {newPassword} = req.body;
    const ngo = await NGO.findById(req.ngo?._id)

    ngo.password= newPassword
    await ngo.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,ngo,"Password updated" ))
})

export {registerNGO,loginNGO, logoutNGO, updateFullNameNGO, forgotPasswordNGO, verifyOTPforPasswordChangeNGO, changeandupdatePasswordNGO}
