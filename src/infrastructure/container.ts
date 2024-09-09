import {asClass, asValue, AwilixContainer, createContainer} from 'awilix';
import UserRepository from "../adapters/repository/user";
import AuthService from "../adapters/service/auth";
import UserService from "../core/user/service";
import UserController from '../ports/controllers/user';
import connectToDatabase from "../infrastructure/db/mongoose";
import TaskController from "../ports/controllers/task";
import TaskService from "../core/task/service";
import TaskRepository from "../adapters/repository/task";
import AppConfig from "../config";
import {MessageQueuePort} from "../ports/message_queue";
import {RabbitMQAdapter} from "../adapters/message_queue/rabbit_mq";

type ContainerDependencies = {
    userRepository: UserRepository;
    taskRepository: TaskRepository;
    authService: AuthService;
    userService: UserService;
    taskService: TaskService;
    userController: UserController;
    taskController: TaskController;
    appConfig: any,
    messageQueue: MessageQueuePort
}
AppConfig.initiate()
connectToDatabase();
const container: AwilixContainer<ContainerDependencies> = createContainer<ContainerDependencies>();


export default container.register({
    userRepository: asClass(UserRepository).singleton(),
    taskRepository: asClass(TaskRepository).singleton(),
    authService: asClass(AuthService).singleton(),
    userService: asClass(UserService).singleton(),
    taskService: asClass(TaskService).singleton(),
    userController: asClass(UserController,).singleton(),
    taskController: asClass(TaskController,).singleton(),
    appConfig: asValue(AppConfig),
    messageQueue: asClass(RabbitMQAdapter).singleton()
});