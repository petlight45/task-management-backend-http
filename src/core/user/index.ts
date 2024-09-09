import {ObjectsHelpers} from "../../helpers/commons/objects";

export type UserParams = {
    _id?: string;
    username: string;
    email: string;
    [key: string]: any
};

export default class User {
    _id?: string;
    username?: string;
    email?: string;
    password?: string

    constructor(params: UserParams) {
        Object.assign(this, params);
    }

    get data(): Partial<UserParams> {
        return ObjectsHelpers.extractAttributesToData(this)
    }

    get id() {
        return this._id
    }


    get dataMini(): Partial<UserParams> {
        const fieldsToRemove = ["password"]
        const data_ = this.data;
        for (let field of fieldsToRemove) {
            delete data_[field]
        }
        return data_
    }
}