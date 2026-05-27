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
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

import userRouter from './routes/user.routes.js'
import taskRouter from './routes/task.routes.js'







app.use("/api/v1/users",userRouter)
app.use("/api/v1/users",taskRouter)

// Global custom error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || []
  });
});

export { app }
