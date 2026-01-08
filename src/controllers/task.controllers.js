import { asynchandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tasks } from "../models/task.model.js";


const addtask = asynchandler(async(req,res)=>{
    const {text} = req.body;

     const task = await Tasks.create({
        text,
        userId : req.user._id
    })

    if(!task){
        throw new ApiError(400,"task name is required")
    }

   

    const createdTask = task.toObject();
     delete createdTask.userId;

        if (!createdTask) {
        throw new ApiError(500, "Something went wrong while creating a tsk");
    }

    return res.status(201).json(
        new ApiResponse(201, createdTask, "task created sucessfully")
    );


})

const deleteTask = asynchandler(async (req, res) => {
    const { taskId } = req.params;
    //for info about params go to this link and scrool down https://chatgpt.com/share/694640a4-c838-8000-b039-a2c40ca40b65

    
    const task = await Tasks.findOne({
        _id: taskId,
        userId: req.user._id
    });

    if (!task) {
        throw new ApiError(404, "Task not found or unauthorized");
    }

    
    await task.deleteOne();

    
    return res.status(200).json(
        new ApiResponse(200, {}, "Task deleted successfully")
    );
});

const changeTaskState = asynchandler(async (req, res) => {

    console.log("PARAM ID:", req.params.taskId);
    const { taskId } = req.params;

    const task = await Tasks.findOne({
        _id: taskId,
        userId: req.user._id
    });

    if (!task) {
        throw new ApiError(404, "Task not found or unauthorized");
    }

    task.isComplete = !task.isComplete;
    await task.save();

    return res.status(200).json(
        new ApiResponse(200, task, "Task status updated successfully")
    );
});


export {
    changeTaskState,
    addtask,
    deleteTask

}
