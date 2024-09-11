import {MockBaseRepository} from "./BaseRepository";
import TaskRepository from "../../../adapters/repository/task";

export const MockTaskRepository: jest.Mocked<TaskRepository> = {
    ...MockBaseRepository
};