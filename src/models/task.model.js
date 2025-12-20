import mongoose, { Schema } from "mongoose";
const TodoSchema = new Schema({
  text: { 
    type: String, 
    required: true 
  },
  isComplete: { 
    type: Boolean, 
    default: false 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  }
 
},
{
        timestamps: true
    }



);

export const Tasks = mongoose.model("Task",TodoSchema)