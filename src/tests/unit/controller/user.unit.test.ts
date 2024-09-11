import request from 'supertest';
import express from 'express';
import {asClass, asFunction, createContainer} from 'awilix';
import MockHelperUtils from "../mocks";
import bodyParser from "body-parser";
import {MockUserService} from "../mocks/UserService";
import {faker} from '@faker-js/faker';
import UserController from "../../../ports/controllers/user";
import {HTTPResponseStatusCode} from "../../../helpers/definitions/response";


describe('UserController', () => {
    let app: any;
    let container: any;

    beforeEach(() => {
        container = createContainer();
        container.register({
            userService: asFunction(() => MockUserService).singleton(),
            userController: asClass(UserController).singleton(),
        });

        const userController = container.resolve('userController');

        // Create an Express app and bind the controller
        app = express();
        app.use(bodyParser.urlencoded({extended: false}), bodyParser.json())
        app.post('/user/private/token/access/profile', userController.fetchUserProfileByAccessToken.bind(userController))
        app.post('/user/token/refresh', userController.refreshUserToken.bind(userController))
        app.post('/user/register', userController.registerUser.bind(userController))
        app.post('/user/login', userController.loginUser.bind(userController))
        app.get('/user/me', userController.fetchProfile.bind(userController))
        app.get('/user/all', userController.fetchUserMultiple.bind(userController))
        app.get('/user/:id', userController.fetchUser.bind(userController));
    });

    it('should return a user profile by access token', async () => {
        const mockUser = MockHelperUtils.generateMockUser();
        const payload = {access_token: faker.string.sample(20)}
        MockUserService.fetchUserProfileByAccessToken.mockResolvedValueOnce(mockUser);
        const res = await request(app).post('/user/private/token/access/profile').send(payload);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual(mockUser);
    });

    it('should refresh user token', async () => {
        const mockRes = {access_token: faker.string.sample(20)};
        const payload = {refresh_token: faker.string.sample(20)}
        MockUserService.refreshUserToken.mockResolvedValueOnce(mockRes);
        const res = await request(app).post('/user/token/refresh').send(payload);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual(mockRes);
    });

    it('should register a user', async () => {
        const mockUser = MockHelperUtils.generateMockUser();
        const payload = {
            email: mockUser.email,
            username: mockUser.username,
            password: faker.internet.password({
                memorable: true,
                pattern: /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$/
            })
        }
        MockUserService.registerUser.mockResolvedValueOnce(mockUser);
        const res = await request(app).post('/user/register').send(payload);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual({email: mockUser.email, username: mockUser.username});
    });

    it('should login a user', async () => {
        const mockUser = MockHelperUtils.generateMockUser();
        const payload = {
            email: mockUser.email,
            password: faker.internet.password({
                memorable: true,
                pattern: /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$/
            })
        }
        MockUserService.authenticateUser.mockResolvedValueOnce(mockUser);
        const res = await request(app).post('/user/login').send(payload);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
    });

    it('should fetch auth user', async () => {
        const mockUser = MockHelperUtils.generateMockUser();
        app.use(MockHelperUtils.mockAuthMiddleware(mockUser))
        const res = await request(app).get('/user/me');
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
    });

    it('should fetch  all user', async () => {
        const mockUsers = [MockHelperUtils.generateMockUser(), MockHelperUtils.generateMockUser()]
        MockUserService.fetchMultipleUsers.mockResolvedValueOnce(mockUsers);
        const res = await request(app).get('/user/all').send(mockUsers);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual(mockUsers);
    });
    it('should fetch  a single user', async () => {
        const mockUser = MockHelperUtils.generateMockUser()
        MockUserService.fetchSingleUser.mockResolvedValueOnce(mockUser);
        const res = await request(app).get(`/user/${mockUser._id}`).send(mockUser);
        expect(res.status).toBe(HTTPResponseStatusCode.SUCCESS);
        expect(res.body).toEqual(mockUser);
    });


});
