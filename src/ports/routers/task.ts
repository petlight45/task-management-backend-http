import express from "express";
import TaskController from '../controllers/task';
import {validateRequestBodyMiddleware} from "../middlewares/validation";
import {TaskChangeState, TaskCreate, TaskUpdate} from "../validators/schema/task";
import {filtersParserFromQueryParamsMiddleware} from "../middlewares/filters";
import TaskFilterFields from "../controllers/filters/task";
import {permissionIsAuthenticatedMiddleware} from "../middlewares/permission";
import container from "../../infrastructure/container";


const router = express.Router()
const taskController = container.resolve<TaskController>('taskController');
router.use(permissionIsAuthenticatedMiddleware,
    filtersParserFromQueryParamsMiddleware({
        filterFields: TaskFilterFields.filter,
        searchFields: TaskFilterFields.search,
        orderingFields: TaskFilterFields.ordering,
        expansionFields: TaskFilterFields.expansion
    }))
// @ts-ignore
router.post('/', [validateRequestBodyMiddleware(TaskCreate)], (req, res, next) => taskController.createTask(req, res, next))
// @ts-ignore
router.get('/:id', (req, res, next) => taskController.fetchTask(req, res, next))
// @ts-ignore
router.get('/', (req, res, next) => taskController.fetchTaskMultiple(req, res, next))
// @ts-ignore
router.patch('/:id', [validateRequestBodyMiddleware(TaskUpdate)], (req, res, next) => taskController.updateTask(req, res, next))
// @ts-ignore
router.delete('/:id', (req, res, next) => taskController.deleteTask(req, res, next))
// @ts-ignore
router.post('/:id/change_state', [validateRequestBodyMiddleware(TaskChangeState)], (req, res, next) => taskController.changeTaskState(req, res, next))


export {router as TaskRouter};