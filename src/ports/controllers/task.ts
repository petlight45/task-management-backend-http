import {NextFunction, Request, Response} from "express";
import {HTTPResponseStatusCode} from "../../helpers/definitions/response";
import TaskService from "../../core/task/service";
import ExceptionsHelper from "../../helpers/exceptions";

export type TaskControllerParams = {
    taskService: any;
};

export default class TaskController {
    private taskService: TaskService;

    constructor(params: TaskControllerParams) {
        this.taskService = params.taskService;
    }

    private filterParamsOwnerShipOnly(req: Request) {
        // @ts-ignore
        const reqUserID = req.user.id;
        const accessFilter = {
            ownerId: reqUserID
        }
        // @ts-ignore
        const specifiedFilters = req._filter || {}
        // @ts-ignore
        const specifiedSearch = req._search || {}
        return {...accessFilter, ...specifiedFilters, ...specifiedSearch}
    }

    private filterParams(req: Request) {
        // @ts-ignore
        const reqUserID = req.user.id;
        const accessFilter = {
            $or: [
                {ownerId: reqUserID},
                {assigneeId: reqUserID}
            ]
        }
        // @ts-ignore
        const specifiedFilters = req._filter || {}
        // @ts-ignore
        const specifiedSearch = req._search || {}
        return {...accessFilter, ...specifiedFilters, ...specifiedSearch}
    }

    private orderingParams(req: Request) {
        // @ts-ignore
        return req._ordering
    }

    private expansionParams(req: Request) {
        // @ts-ignore
        return req._expansion
    }

    async createTask(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const task = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.taskService.createTask(
                // @ts-ignore
                {ownerId: req.user.id, ...req.body}
            )), on_error: next
        });
        // @ts-ignore
        return task.is_success && res.status(HTTPResponseStatusCode.CREATED).json(task.data);
    }

    async fetchTask(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const task = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.taskService.fetchSingleTask(req.params.id, this.filterParams(req), this.expansionParams(req))),
            on_error: next
        });
        // @ts-ignore
        return task.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(task.data);
    }

    async fetchTaskMultiple(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const task = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.taskService.fetchMultipleTasks(this.filterParams(req), this.orderingParams(req), this.expansionParams(req))),
            on_error: next
        });
        // @ts-ignore
        return task.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(task.data);
    }

    async updateTask(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const task = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.taskService.updateTask(req.params.id, req.body, this.filterParamsOwnerShipOnly(req))),
            on_error: next
        });
        // @ts-ignore
        return task.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(task.data);
    }


    async changeTaskState(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {state} = req.body;
        const task = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.taskService.updateTask(req.params.id, {state})), on_error: next
        });
        // @ts-ignore
        return task.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(task.data);
    }

    async deleteTask(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const task = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.taskService.deleteTask(req.params.id, this.filterParamsOwnerShipOnly(req))),
            on_error: next
        });
        // @ts-ignore
        return task.is_success && res.status(HTTPResponseStatusCode.NO_RESPONSE).json(task.data);
    }
}
