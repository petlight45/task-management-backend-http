import Joi from "joi";
import {TaskStateEnum} from "../../../core/task/enums";

export const TaskCreate = Joi.object({
    name: Joi.string()
        .trim()
        .max(64)
        .required(),
    description: Joi.string()
        .trim()
        .max(1024),
    dueDate: Joi.date().greater('now').messages({
        'date.greater': 'The due date must be in the future',
    }),
    assigneeId: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
        .message('Invalid ID')
        .trim(),
    state: Joi.string().trim().valid(...Object.values(TaskStateEnum))

})
export const TaskUpdate = Joi.object({
    name: Joi.string()
        .trim()
        .max(64),
    description: Joi.string()
        .trim()
        .max(1024),
    dueDate: Joi.date().greater('now').messages({
        'date.greater': 'The due date must be in the future',
    }),
    assigneeId: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
        .message('Invalid ID')
        .trim(),
    state: Joi.string().trim().valid(...Object.values(TaskStateEnum))
})

export const TaskChangeState = Joi.object({
    state: Joi.string().trim().valid(...Object.values(TaskStateEnum)).required()
})