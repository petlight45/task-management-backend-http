import UserController from "../../../ports/controllers/user";

export const MockUserController: jest.Mocked<UserController> = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    refreshUserToken: jest.fn(),
    fetchProfile: jest.fn(),
    fetchUserProfileByAccessToken: jest.fn(),
    fetchUser: jest.fn(),
    fetchUserMultiple: jest.fn(),
};