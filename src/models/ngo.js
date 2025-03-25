import { profile } from "console";
import mongoose from "mongoose";
import { type } from "os";
import jwt from "jsonwebtoken"

const ngoSchema = new mongoose.Schema({
    uniqueIdentificationNumber:{
        type: String,
        required: true,
        unique: true,
        index: true
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
    password : {
        type : String,
        required : true,
    },
    phone_number : {
        type : String
    },
    profileImage : {
        type:String, // cloudinary url
    },
    refreshToken : {
        type : String
    },
    list_of_abuses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Abuse"
    }]
}, {timestamps:true})

ngoSchema.methods.generateAccessToken = function () {
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

ngoSchema.methods.generateRefreshToken = function () {
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

export const NGO = mongoose.model("NGO", ngoSchema)