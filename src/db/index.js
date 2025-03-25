import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { URL } from "url";
dotenv.config();

const connectDB = async ()=>{
    try {
        const proxyURLString = process.env.PROXY_URL; // Get the URL string from env
        if (!proxyURLString) {
            throw new Error("PROXY_URL environment variable is not set.");
        }

        // const proxyUrl = new URL(proxyURLString); 

        // const agent = new http.Agent({ // Or https.Agent for HTTPS
        //     host: proxyUrl.hostname,
        //     port: proxyUrl.port,
        //     path: proxyUrl.pathname,
        //     auth: `${proxyUrl.username}:${proxyUrl.password}`, // Important: Include auth here
        // })

        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URL}`, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // serverApi: {
            //     version: '1',
            //     strict: true,
            //     deprecationErrors: true,
            // },
            // serverSelectionTimeoutMS: 5000,
            //agent:agent
        })
        console.log(`MongoDB connected !! DB Host: ${connectioninstance.connection.host}`);
    } catch (error) {
        console.log("error in db connection", error)
        process.exit(1)       
    }
}

export default connectDB