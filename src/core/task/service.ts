import Task, {TaskParams} from "./index";
import {TaskMessageEventType} from "./enums";

type TaskServiceParams = {
    taskRepository: any;
    messageQueue: any
    appConfig: any
};

export default class TaskService {
    private taskRepository?: any;
    private messageQueue?: any;
    private appConfig?: any;


    constructor(params: TaskServiceParams) {
        this.taskRepository = params.taskRepository;
        this.messageQueue = params.messageQueue;
        this.appConfig = params.appConfig;
    }

    private sendMessageToQueue(message: any) {
        this.messageQueue.sendMessage(
            this.appConfig.MESSAGE_QUEUE_NAME,
            message
        )
    }

    async createTask(data: TaskParams) {
        const task = new Task(data)
        return await this.taskRepository.create(task).then((res: any) => {
            this.sendMessageToQueue({eventType: TaskMessageEventType.ON_TASK_CREATED, payload: res})
            return res
        });
    }

    async fetchMultipleTasks(filterParams: any, sortParams?: any, expansionParams?: any) {
        return await this.taskRepository.fetchMultiple(filterParams, sortParams, expansionParams);
    }

    async fetchSingleTask(id: string, filterParams: any, expansionParams?: any) {
        return await this.taskRepository.fetchSingle({_id: id, ...filterParams}, false, expansionParams);
    }

    async updateTask(id: string, data: any, filterParams: any) {
        return await this.taskRepository.update({_id: id, ...filterParams}, data).then((res: any) => {
            this.sendMessageToQueue({eventType: TaskMessageEventType.ON_TASK_UPDATED, payload: res})
            return res
        });
    }

    async deleteTask(id: string, filterParams: any) {
        return await this.taskRepository.delete({_id: id, ...filterParams}).then((res: any) => {
            this.sendMessageToQueue({eventType: TaskMessageEventType.ON_TASK_DELETED, payload: res})
            return res
        });
    }
}