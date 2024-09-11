import AuthService from "../../../adapters/service/auth";

export const MockAuthService: jest.Mocked<AuthService> = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
    generateToken: jest.fn(),
    decodeToken: jest.fn()
};