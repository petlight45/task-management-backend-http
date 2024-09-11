import {faker} from '@faker-js/faker';
import {UserParams} from "../../../core/user";
import {TaskParams} from "../../../core/task";
import {TaskStateEnum} from "../../../core/task/enums";

export default class MockHelperUtils {
    static generateMockUser(): UserParams {
        return {
            _id: faker.string.uuid(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            dataMini: {}
        };
    }

    static generateMockTask(): TaskParams {
        return {
            _id: faker.string.uuid(),
            name: faker.lorem.words(3),
            assigneeId: faker.string.uuid(),
            dueDate: faker.date.future().toString(),
            state: faker.helpers.arrayElement(Object.values(TaskStateEnum)),
            description: faker.lorem.paragraph(),
        };
    }

    static mockAuthMiddleware(user?: any) {
        return (req, res, next) => {
            req.user = user || MockHelperUtils.generateMockUser();
            next();
        }
    };
}