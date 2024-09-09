import {TaskStateEnum} from "./enums";
import {ObjectsHelpers} from "../../helpers/commons/objects";

export type TaskParams = {
    _id?: string;
    name: string;
    assigneeId: string;
    dueDate?: Date;
    state?: TaskStateEnum;
    description?: string;
};

export default class Task {
    _id?: string;
    name?: string;
    assigneeId?: string;
    dueDate?: Date;
    state?: TaskStateEnum;
    description?: string;

    constructor(params: TaskParams) {
        Object.assign(this, params);
    }

    get id() {
        return this._id
    }

    get data(): Partial<TaskParams> {
        return ObjectsHelpers.extractAttributesToData(this)
    }
}
