import { Abuse } from "../models/abuse";
import { Volunteer } from "../models/volunteer";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { NGO } from "../models/ngo";
import { uploadOnCloudinary } from "../utils/cloudinary";

function generateRandomString(length) {
    const characters = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const reportAbuse = asyncHandler(async (req,res)=>{
    const {latitude, longitude, description, urgencyOFsituation,emailOfVolunteer} = req.body

    if(!latitude || !longitude || !description || !urgencyOFsituation || !emailOfVolunteer){
        throw new ApiError(400, "All feilds required to repost an abuse")
    }

    const abuseId = generateRandomString(6)

    let abuseProofpath
    if(req.files && Array.isArray(req.files.Abuse_photoORvedio) && req.files.Abuse_photoORvedio.length > 0){
        abuseProofpath = req.files.Abuse_photoORvedio[0].path
    }
    const abuseProof = await uploadOnCloudinary(abuseProofpath)

    const abuseStatus = "Complaint Registered"

    const abuse = await Abuse.create({
        abuseId,
        urgencyOFsituation,
        latitude,
        longitude,
        description,
        abuseStatus,
        Abuse_photoORvedio:abuseProof?.url || ""
    })

    const volunteer = await Volunteer.findById(emailOfVolunteer)

    if(!volunteer){
        console.log("volunteer not found")
    }

    volunteer.list_of_abuses.push(abuseId);
    await volunteer.save();

    return res.status(201).json(
        new ApiResponse(200, abuse, "User registered successfully")
    )

})

const viewAbusestoNGO = asyncHandler(async (req,res)=>{
    const abuses = await Abuse.find({abuseStatus: "Complaint Registered"}).sort({urgencyOFsituation:1})
    //console.log(abuses)
    return res.status(200).json(new ApiResponse(200,abuses,"List of Animal abuses"))
})

const viewAbusesUnderAttentionOfNGO = asyncHandler(async (req,res)=>{
    const uniqueIdentificatinNumber = req.body.uniqueIdentificatinNumber
    const ngo = await NGO.findById(uniqueIdentificatinNumber)
    const abuses = ngo.list_of_abuses;
    return res.status(200).json(new ApiResponse(200,abuses,"Abuses under attention of ngo sent successfully"))
})

const updateStatusofComplaint = asyncHandler(async (req,res)=>{
    const {abuseId,abuseStatus,uniqueIdentificatinNumber} = req.body;
    const abuse = await Abuse.findByIdAndUpdate(abuseId,{
        abuseStatus:abuseStatus
    })

    const ngo = await NGO.findById(uniqueIdentificatinNumber)

    ngo.list_of_abuses.push(abuse)
    await ngo.save()

    return res.status(200).json(new ApiResponse(200,abuse,"Status of complaint changed"))
})

const viewAbusestoVolunteer = asyncHandler(async (req,res)=>{
    const email = req.body.email
    const volunteer = await Volunteer.findById(email);
    if(!volunteer){
        console.log("volunteer not found")
    }
    const abuses = volunteer.list_of_abuses
    
    return res.status(200).json(new ApiResponse(200,abuses,"the abuses reported by volunteer expressed"))
})

export {reportAbuse,viewAbusestoNGO,updateStatusofComplaint,viewAbusesUnderAttentionOfNGO,viewAbusestoVolunteer}