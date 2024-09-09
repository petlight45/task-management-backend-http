import {DateTimeFilterField, StringFilterField} from "../fields";

export default class TaskFilterFields {
    static get filter() {
        return {
            "state": StringFilterField,
            "ownerId": StringFilterField,
            "assigneeId": StringFilterField,
            "dueDate": DateTimeFilterField,
            "createdAt": DateTimeFilterField
        }
    }

    static get search() {
        return ["name", "description"]
    }

    static get ordering() {
        return ["name", "assigneeId", "ownerId", "state", "dueDate", "createdAt"]
    }

    static get expansion() {
        return ["ownerId", "assigneeId"]
    }
}