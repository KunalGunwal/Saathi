import { Animal } from "../models/animal";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

function generateRandomString(length) {
    const characters = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const registerAnAnimalforAdoption = asyncHandler(async (req,res)=>{
    const {animaltype,animalDescription,animalLocation} = req.body

    const animalId = generateRandomString(6)

    if(!animaltype || !animalDescription || !animalLocation){
        throw new ApiError(400, "All feilds required while regitering")
    }

    const existedAnimal = await Animal.findOne({
        $or:[{animalId}]
    })
    if(existedAnimal) {
        throw new ApiError(409, "Animal ")
    }
    console.log(req.files)

    let animalPicLocation;
    if(req.files && Array.isArray(req.files.animalPic) && req.files.animalPic.length > 0){
        animalPicLocation = req.files.animalPic[0].path
    }

    //const avatar = await uploadOnCloudinary(avatarLocalPath)
    const animalStatus = "Not Adopted Yet";
    const animalPic = await uploadOnCloudinary(animalPicLocation)
    console.log("The profile image is :" , animalPic)

    // if(!avatar){
    //     throw new ApiError(400,"Avatar file is required")
    // }

    const animal = await Animal.create({
        animalId,
        animaltype,
        animalPic: animalPic?.url || "",
        animalDescription,
        animalLocation,
        adoptionStatus:animalStatus
    })



    const createdAnimal = await Animal.findById(animal._id).select(
        "-password -refreshToken"
    )

    if(!createdAnimal){
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdAnimal, "User registered successfully")
    )
})

const veiwAnimalsAvailableforAdoption = asyncHandler(async (req,res)=>{
    const animals = await Animal.find({adoptionStatus: "Not Adopted Yet", })
    //console.log(abuses)
    return res.status(200).json(new ApiResponse(200,animals,"List of Animal abuses"))
})

const adoptAnimal = asyncHandler(async(req,res)=>{
    const animalId = req.body.animalId
    const adoptedAnimal = await Animal.findByIdAndUpdate(animalId,{adoptionStatus:"Adopted"});
    return res.status(200).json(new ApiResponse(200,adoptedAnimal,"Animal adopted successfully"))
})


export {registerAnAnimalforAdoption, veiwAnimalsAvailableforAdoption,adoptAnimal}