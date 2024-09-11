import {faker} from '@faker-js/faker';
import {TaskStateEnum} from "../../../core/task/enums";
import {TaskParams} from "../../../core/task";
import {UserParams} from "../../../core/user";

export class IntegrationTestMockUtils {
    static getMockTaskCreate(ownerId: string, assigneeId: string, state?: string): TaskParams {
        return {
            name: faker.lorem.words(3),
            ownerId: ownerId,
            assigneeId: assigneeId,
            dueDate: faker.date.future().toString(),
            state: state || faker.helpers.arrayElement(Object.values(TaskStateEnum)),
            description: faker.lorem.paragraph(),
        }
    }

    static getMockUserCreate(password?: string): UserParams {
        return {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: password || faker.internet.password({
                length: 10,
                memorable: true,
                pattern: /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$/
            })
        }
    }
}