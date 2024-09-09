import {NextFunction, Request, Response} from "express";
import {HTTPResponseStatusCode} from "../../helpers/definitions/response";
import UserService from "../../core/user/service";
import ExceptionsHelper from "../../helpers/exceptions";

export type UserControllerParams = {
    userService: any;
};

export default class UserController {
    private userService: UserService;

    constructor(params: UserControllerParams) {
        this.userService = params.userService;
    }

    async registerUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {email, username, password} = req.body;
        const user = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.userService.registerUser({
                    email, username, password
                }
            )), on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json({
            id: user?.data.id, email, username
        });
    }

    async loginUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {email, password} = req.body;
        const token = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.userService.authenticateUser({
                    email, password
                }
            )), on_error: next
        });
        // @ts-ignore
        return token.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(
            token?.data
        );
    }

    async refreshUserToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {refresh_token} = req.body;
        const token = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.userService.refreshUserToken({
                    refreshToken: refresh_token
                }
            )), on_error: next
        });
        // @ts-ignore
        return token.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(
            token?.data
        );
    }

    async fetchProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        return res.status(HTTPResponseStatusCode.SUCCESS).json(
            // @ts-ignore
            req?.user?.dataMini
        );
    }

    async fetchUserProfileByAccessToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // @ts-ignore
        const {access_token} = req.body;
        const user = await ExceptionsHelper.executeCallbackAsync({
            callback: async () => (await this.userService.fetchUserProfileByAccessToken({
                    accessToken: access_token
                }
            )), on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(
            user?.data
        );
    }

    async fetchUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const user = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.userService.fetchSingleUser(req.params.id)),
            on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(user.data);
    }

    async fetchUserMultiple(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const user = await ExceptionsHelper.executeCallbackAsync({
            // @ts-ignore
            callback: async () => (await this.userService.fetchMultipleUsers()),
            on_error: next
        });
        // @ts-ignore
        return user.is_success && res.status(HTTPResponseStatusCode.SUCCESS).json(user.data);
    }
}
