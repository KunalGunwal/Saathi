import mongoose from "mongoose";
import { type } from "os";
import jwt from "jsonwebtoken"

const volunteerSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // seaching easy ho jati h
    },
    email : {
        type : String,
        required : true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName : {
        type : String,
        required : true,
        trim: true, 
        index: true          
    },
    password:{
        type:String,
        required:true
    },
    profileImage : {
        type:String, // cloudinary url
    },
    phone_number : {
        type : String,
    },
    refreshToken:{
        type : String
    },
    list_of_abuses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Abuse"
    }]
}, {timestamps:true}
)

volunteerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

volunteerSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const Volunteer = mongoose.model("Volunteer" , volunteerSchema)