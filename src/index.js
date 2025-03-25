import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { app } from "./app.js";
dotenv.config()

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server running at ${process.env.PORT || 8000}`)
    })
})
.catch((err)=>{
    console.log("error in database connection", err)
})