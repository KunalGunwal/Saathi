import mongoose, { Mongoose } from "mongoose";

const animalSchema = new mongoose.Schema({
    animalId : {
        type : String,
        required : true
    },
    animaltype : {
        type : String,
        required : true,
    },
    animalPic: {
        type : String
    },
    animalDescription: {
        type: String,
        required : true
    },
    animalLocation : {
        type: String,
        required : true
    },
    adoptionStatus : {
        type : String,
        required : true
    }
},{timestamps:true})

export const Animal = mongoose.model("Animal", animalSchema)