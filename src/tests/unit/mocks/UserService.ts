import UserService from "../../../core/user/service";

export const MockUserService: jest.Mocked<UserService> = {
    registerUser: jest.fn(),
    authenticateUser: jest.fn(),
    refreshUserToken: jest.fn(),
    fetchUserProfileByAccessToken: jest.fn(),
    fetchMultipleUsers: jest.fn(),
    fetchSingleUser: jest.fn(),
};