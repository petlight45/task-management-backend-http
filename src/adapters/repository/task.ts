import {BaseRepository} from "./index";
import Task, {TaskInterface} from "../../core/task/model/Task";

export default class TaskRepository extends BaseRepository<TaskInterface> {
    constructor() {
        super(Task);
    }
}

