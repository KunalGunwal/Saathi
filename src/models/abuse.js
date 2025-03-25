import mongoose from "mongoose";

const abuseSchema  = new mongoose.Schema({
    abuseId:{
        type:String,
        required:true
    },
    urgencyOFsituation:{
        type: Number,
        required: true
    },
    animal:{
        type:String,
        required:true
    },
    latitude:{
        type: String,
        required: true
    },
    longitude:{
        type:String,
        required:true
    },
    description : {
        type: String,
        required: true
    },
    Abuse_photoORvedio : {
        type: String
    },
    abuseStatus:{
        type: String,
        required:true
    }
}, {timestamps:true})


export const Abuse = mongoose.model("Abuse", abuseSchema)