import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

process.on("uncaughtException", err => {
  console.error("UNCAUGHT:", err);
});

const app = express()
app.use(cookieParser())
app.use(express.json());

const allowedOrigins = [
  "https://authtodo-fronend-ola6.vercel.app",
  "https://authtodo-frontend-ola6.vercel.app",
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
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
