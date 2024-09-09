import mongoose, {Document, Schema} from 'mongoose';
import {TaskStateEnum} from "../enums";

export interface TaskInterface extends Document {
    name: string;
    description?: string;
    state: TaskStateEnum;
    ownerId: string; // User ID of the creator
    assigneeId?: string; // User ID of the assignee
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema<TaskInterface> = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    state: {type: String, enum: Object.values(TaskStateEnum), default: TaskStateEnum.PENDING},
    // @ts-ignore
    ownerId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    assigneeId: {type: Schema.Types.ObjectId, ref: 'User'},
    dueDate: {type: Date},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now, update: true},
});


export default mongoose.model<TaskInterface>('Task', TaskSchema);
