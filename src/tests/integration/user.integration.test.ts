import request from 'supertest';
import {HTTPResponseStatusCode} from "../../helpers/definitions/response";
import container from "../../infrastructure/container";
import {UserParams} from "../../core/user";
import app, {startApp} from "../../app";
import {disconnectFromDatabase} from "../../infrastructure/db/mongoose";
import {IntegrationTestMockUtils} from "./mocks";


describe('UserIntegration', () => {
    let apiRoutePrefix: string;
    let userRepository: any;
    let authUser: UserParams
    let authToken: string;
    let authTokenRefresh: string;
    let authUserPassword: string;
    let otherUser: UserParams
    let appConfig: any

    beforeAll(async () => {
        await startApp();
        const userService = container.resolve("userService");
        const authUserData = IntegrationTestMockUtils.getMockUserCreate()
        authUser = await userService.registerUser(authUserData)
        console.log(authUser)
        authUserPassword = authUserData.password
        otherUser = await userService.registerUser(IntegrationTestMockUtils.getMockUserCreate())
        const {access, refresh} = await userService.authenticateUser({
            email: authUser.email,
            password: authUserData.password
        })
        authToken = access;
        authTokenRefresh = refresh;
        appConfig = container.resolve('appConfig');
        userRepository = container.resolve("userRepository")
        apiRoutePrefix = `/v${appConfig.API_VERSION}/api`
    });

    afterAll(async () => {
        const logger = container.resolve('logger');
        await disconnectFromDatabase(logger); // Disconnect after all tests
    });

    it('should fetch profile of a user with token', async () => {
        const payload = {
            access_token: authToken
        }
        const res = await request(app).post(`${apiRoutePrefix}/user/private/token/access/profile`).set('secret-key', appConfig.PRIVATE_ENDPOINT_SECRET_KEY).send(payload);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body?._id).toEqual(authUser._id?.toString());
    });

    it('register user', async () => {
        const userData = IntegrationTestMockUtils.getMockUserCreate("Test12345@jest")
        const payload = {
            username: userData.username,
            email: userData.email,
            password: userData.password
        }
        const res = await request(app).post(`${apiRoutePrefix}/user/register`).send(payload);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body?.username).toEqual(userData.username?.toString());
    });

    it('login user', async () => {
        const payload = {
            email: authUser.email,
            password: authUserPassword
        }
        const res = await request(app).post(`${apiRoutePrefix}/user/login`).send(payload);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
    });

    it('fetch auth user profile', async () => {
        const res = await request(app).get(`${apiRoutePrefix}/user/me`).set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body?.username).toEqual(authUser.username?.toString());
    });

    it('should return all users', async () => {
        const mockUsers = [IntegrationTestMockUtils.getMockUserCreate(),
            IntegrationTestMockUtils.getMockUserCreate()]
        mockUsers.forEach(async (item) => {
            await userRepository.create(item)
        })
        const res = await request(app).get(`${apiRoutePrefix}/user/all`).set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body.length).toBeGreaterThanOrEqual(mockUsers.length);
    });

    it('should return a single user', async () => {
        const mockUser = IntegrationTestMockUtils.getMockUserCreate()
        const user = await userRepository.create(mockUser)
        const res = await request(app).get(`${apiRoutePrefix}/user/${user._id}`).set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body?.username).toEqual(user.username?.toString());
    });

    it('should refresh user token', async () => {
        const payload = {
            refresh_token: authTokenRefresh
        }
        const res = await request(app).post(`${apiRoutePrefix}/user/token/refresh`).send(payload);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
    });

});
