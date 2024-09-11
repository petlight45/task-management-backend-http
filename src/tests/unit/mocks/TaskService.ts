import TaskService from "../../../core/task/service";

export const MockTaskService: jest.Mocked<TaskService> = {
    createTask: jest.fn(),
    fetchMultipleTasks: jest.fn(),
    fetchSingleTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    sendMessageToQueue: jest.fn()
};