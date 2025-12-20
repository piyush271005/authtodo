import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

process.on("uncaughtException", err => {
  console.error("UNCAUGHT:", err);
});

const app = express()
app.use(cookieParser())
app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

import userRouter from './routes/user.routes.js'
import { registerUser } from "./controllers/user.controller.js";


app.use("/api/v1/users",userRouter)


app.get("/", (req, res) => {
    res.send("OK");
});





app.use("/api/v1/users", userRouter)


export { app }
