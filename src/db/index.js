import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try{
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("mongodb connected sucessfully")

    }
    catch(error){
        console.log(`mongo db error${error}`)
        process.exit(1); // <--- STOP THE SERVER

    }
}

export default connectDB


