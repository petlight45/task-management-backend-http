import {asClass, asFunction, asValue, createContainer} from 'awilix';
import MockHelperUtils from "../mocks";
import {mockMessageQueue} from "../mocks/MessageQueue";
import {MockTaskRepository} from "../mocks/TaskRepository";
import TaskService from "../../../core/task/service";
import AppConfig from "../../../config";
import {WinstonLogger} from "../../../adapters/logger/winston";

describe('TaskService', () => {
    let taskService: TaskService;
    let container: any;

    beforeEach(() => {
        container = createContainer();
        container.register({
            taskService: asClass(TaskService).singleton(),
            taskRepository: asFunction(() => MockTaskRepository).singleton(),
            appConfig: asValue(AppConfig),
            messageQueue: asFunction(() => mockMessageQueue).singleton(),
            logger: asClass(WinstonLogger).singleton()
        });

        // Resolve the TaskService from the container
        taskService = container.resolve('taskService');
    });

    it('should create a task', async () => {
        const mockTask = MockHelperUtils.generateMockTask();
        MockTaskRepository.create.mockResolvedValueOnce(mockTask);
        const result = await taskService.createTask(mockTask);
        expect(result).toEqual(mockTask);
    });

    it('should fetch multiple tasks', async () => {
        const mockTasks = [MockHelperUtils.generateMockTask(), MockHelperUtils.generateMockTask()];
        MockTaskRepository.fetchMultiple.mockResolvedValueOnce(mockTasks);
        const result = await taskService.fetchMultipleTasks();
        expect(result).toEqual(mockTasks);
    });

    it('should fetch single task', async () => {
        const mockTask = MockHelperUtils.generateMockTask();
        MockTaskRepository.fetchSingle.mockResolvedValueOnce(mockTask);
        const result = await taskService.fetchSingleTask("1");
        expect(result).toEqual(mockTask);
    });

    it('should update a single task', async () => {
        const mockTask = MockHelperUtils.generateMockTask();
        MockTaskRepository.update.mockResolvedValueOnce(mockTask);
        const result = await taskService.updateTask("1", mockTask);
        expect(result).toEqual(mockTask);
        expect(MockTaskRepository.update).toHaveBeenCalledWith({_id: "1"}, mockTask);
    });

    it('should delete a single task', async () => {
        const mockTask = MockHelperUtils.generateMockTask();
        MockTaskRepository.delete.mockResolvedValueOnce(mockTask);
        const result = await taskService.deleteTask("1");
        expect(result).toEqual(mockTask);
    });


});
