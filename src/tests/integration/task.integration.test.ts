import request from 'supertest';
import {HTTPResponseStatusCode} from "../../helpers/definitions/response";
import container from "../../infrastructure/container";
import {TaskParams} from "../../core/task";
import app, {startApp} from "../../app";
import {disconnectFromDatabase} from "../../infrastructure/db/mongoose";
import {UserParams} from "../../core/user";
import {IntegrationTestMockUtils} from "./mocks";
import {faker} from '@faker-js/faker';
import {TaskStateEnum} from "../../core/task/enums";


describe('TaskIntegration', () => {
    let apiRoutePrefix: string;
    let taskRepository: any;
    let authUser: UserParams
    let authToken: string;
    let otherUser: UserParams

    beforeAll(async () => {
        await startApp();
        const userService = container.resolve("userService");
        const authUserData = IntegrationTestMockUtils.getMockUserCreate()
        authUser = await userService.registerUser(authUserData)
        otherUser = await userService.registerUser(IntegrationTestMockUtils.getMockUserCreate())
        const {access, refresh} = await userService.authenticateUser({
            email: authUser.email,
            password: authUserData.password
        })
        authToken = access;
        const appConfig = container.resolve('appConfig');
        taskRepository = container.resolve("taskRepository")
        apiRoutePrefix = `/v${appConfig.API_VERSION}/api`
    });

    afterAll(async () => {
        const logger = container.resolve('logger');
        await disconnectFromDatabase(logger); // Disconnect after all tests
    });


    it('should return a task', async () => {
        const mockTask = IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string);
        // Creating a task
        const task: TaskParams = await taskRepository.create(mockTask)
        const res = await request(app).get(`${apiRoutePrefix}/task/${task._id}`).set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body?._id).toEqual(task._id?.toString());
    });

    it('should return a 404 not found', async () => {
        const mockTask = IntegrationTestMockUtils.getMockTaskCreate(otherUser._id as string, otherUser._id as string);
        // Creating a task
        const task: TaskParams = await taskRepository.create(mockTask)
        const res = await request(app).get(`${apiRoutePrefix}/task/${task._id}`).set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(HTTPResponseStatusCode.NOT_FOUND);
    });

    it('should return multiple tasks', async () => {
        const mockTasks = [IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string),
            IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string)]
        mockTasks.forEach(async (item) => {
            await taskRepository.create(item)
        })
        const res = await request(app).get(`${apiRoutePrefix}/task`).set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body.length).toBeGreaterThanOrEqual(mockTasks.length);
    });


    it('should return multiple tasks - filter by state', async () => {
        const mockTasks = [IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string),
            IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string)]
        mockTasks.forEach(async (item) => {
            await taskRepository.create(item)
        })
        const queryParams = {
            state: TaskStateEnum.COMPLETED
        }
        const res = await request(app).get(`${apiRoutePrefix}/task`).set('Authorization', `Bearer ${authToken}`).query(queryParams);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
    });

    it('should return multiple tasks - search', async () => {
        const mockTasks = [IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string),
            IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string)]
        mockTasks.forEach(async (item) => {
            await taskRepository.create(item)
        })
        const queryParams = {
            search: "Lorem"
        }
        const res = await request(app).get(`${apiRoutePrefix}/task`).set('Authorization', `Bearer ${authToken}`).query(queryParams);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
    });

    it('should return multiple tasks - ordering', async () => {
        const mockTasks = [IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string),
            IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string)]
        mockTasks.forEach(async (item) => {
            await taskRepository.create(item)
        })
        const queryParams = {
            ordering: "name"
        }
        const res = await request(app).get(`${apiRoutePrefix}/task`).set('Authorization', `Bearer ${authToken}`).query(queryParams);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
    });

    it('should create a task', async () => {
        const mockTask = IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string)
        delete mockTask.ownerId
        const res = await request(app).post(`${apiRoutePrefix}/task`).set('Authorization', `Bearer ${authToken}`).send(mockTask);
        expect(res.status).toBe(HTTPResponseStatusCode.CREATED);
        expect(res.body?.name).toEqual(mockTask.name?.toString());
    });

    it('should update a task', async () => {
        const mockTask = IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string);
        // Creating a task
        const task: TaskParams = await taskRepository.create(mockTask)
        const updateData = {
            name: faker.lorem.words(3)
        }
        const res = await request(app).patch(`${apiRoutePrefix}/task/${task._id}`).set('Authorization', `Bearer ${authToken}`).send(updateData);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body?._id).toEqual(task._id?.toString());
    });

    it('should delete a task', async () => {
        const mockTask = IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string);
        // Creating a task
        const task: TaskParams = await taskRepository.create(mockTask)
        const res = await request(app).delete(`${apiRoutePrefix}/task/${task._id}`).set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(HTTPResponseStatusCode.NO_RESPONSE);
    });


    it('should change a task state', async () => {
        const mockTask = IntegrationTestMockUtils.getMockTaskCreate(authUser._id as string, otherUser._id as string);
        // Creating a task
        const task: TaskParams = await taskRepository.create(mockTask)
        const updateData = {
            state: TaskStateEnum.COMPLETED
        }
        const res = await request(app).post(`${apiRoutePrefix}/task/${task._id}/change_state`).set('Authorization', `Bearer ${authToken}`).send(updateData);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
    });

});