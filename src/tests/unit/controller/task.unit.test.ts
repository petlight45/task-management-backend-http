import request from 'supertest';
import express from 'express';
import {asClass, asFunction, createContainer} from 'awilix';
import MockHelperUtils from "../mocks";
import bodyParser from "body-parser";
import {MockTaskService} from "../mocks/TaskService";
import TaskController from "../../../ports/controllers/task";
import {HTTPResponseStatusCode} from "../../../helpers/definitions/response";
import {TaskStateEnum} from "../../../core/task/enums";

describe('TaskController', () => {
    let app: any;
    let container: any;

    beforeEach(() => {
        container = createContainer();
        container.register({
            taskService: asFunction(() => MockTaskService).singleton(),
            taskController: asClass(TaskController).singleton(),
        });

        const taskController = container.resolve('taskController');

        app = express();
        app.use(MockHelperUtils.mockAuthMiddleware())
        app.use(bodyParser.urlencoded({extended: false}), bodyParser.json())
        app.get('/task/:id', taskController.fetchTask.bind(taskController));
        app.patch('/task/:id', taskController.updateTask.bind(taskController));
        app.delete('/task/:id', taskController.deleteTask.bind(taskController));
        app.post('/task', taskController.createTask.bind(taskController));
        app.post('/task/:id/change_state', taskController.changeTaskState.bind(taskController));
        app.get('/task', taskController.fetchTaskMultiple.bind(taskController));
    });

    it('should return a task', async () => {
        const mockTask = MockHelperUtils.generateMockTask();
        MockTaskService.fetchSingleTask.mockResolvedValueOnce(mockTask);
        const res = await request(app).get('/task/1');
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual(mockTask);
    });

    it('should return multiple task', async () => {
        const mockTasks = [
            MockHelperUtils.generateMockTask(),
            MockHelperUtils.generateMockTask()
        ]
        MockTaskService.fetchMultipleTasks.mockResolvedValueOnce(mockTasks);
        const res = await request(app).get('/task');
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual(mockTasks);
    });

    it('should create a task', async () => {
        const mockTask = MockHelperUtils.generateMockTask()
        MockTaskService.createTask.mockResolvedValueOnce(mockTask);
        const res = await request(app).post('/task').send(mockTask);
        expect(res.status).toBe(HTTPResponseStatusCode.CREATED);
        expect(res.body).toEqual(mockTask);
    });

    it('should update a task', async () => {
        const mockTask = MockHelperUtils.generateMockTask()
        MockTaskService.updateTask.mockResolvedValueOnce(mockTask);
        const res = await request(app).patch('/task/1');
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual(mockTask);
    });

    it('should delete a task', async () => {
        const mockTask = MockHelperUtils.generateMockTask()
        MockTaskService.deleteTask.mockResolvedValueOnce(mockTask);
        const res = await request(app).delete('/task/1');
        expect(res.status).toBe(HTTPResponseStatusCode.NO_RESPONSE);
        expect(res.body).toEqual({});
    });
    it('should change a task state', async () => {
        const mockTask = MockHelperUtils.generateMockTask()
        MockTaskService.updateTask.mockResolvedValueOnce(mockTask);
        const res = await request(app).post('/task/1/change_state').send({state: TaskStateEnum.COMPLETED});
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual(mockTask);
    });


});
