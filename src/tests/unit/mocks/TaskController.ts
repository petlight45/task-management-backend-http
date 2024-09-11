import TaskController from "../../../ports/controllers/task";

export const MockTaskController: jest.Mocked<TaskController> = {
    createTask: jest.fn(),
    fetchTask: jest.fn(),
    fetchTaskMultiple: jest.fn(),
    updateTask: jest.fn(),
    changeTaskState: jest.fn(),
    deleteTask: jest.fn(),
};