import { Router } from "express";
import { 
    changeTaskState,
    addtask,
    deleteTask
 } from "../controllers/task.controllers.js";

 import { verifyJWT } from "../middlewares/auth.middleware.js";

 
const router = Router()

router.route("/addtask").post(verifyJWT,addtask)
router.route("/delete-task/:taskId").post(verifyJWT,deleteTask)

router.route("/change-state/:taskId").post(verifyJWT, changeTaskState)


export default router


