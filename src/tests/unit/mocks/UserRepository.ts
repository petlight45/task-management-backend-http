import {MockBaseRepository} from "./BaseRepository";
import UserRepository from "../../../adapters/repository/user";

export const MockUserRepository: jest.Mocked<UserRepository> = {
    ...MockBaseRepository,
    findByEmail: jest.fn(),
    findByUserName: jest.fn(),
    fetchMultiple: jest.fn()
};