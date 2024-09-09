import CustomException from "../../helpers/exceptions/custom_exception";
import {HTTPResponseStatusCode} from "../../helpers/definitions/response";
import User, {UserParams} from "./index";
import AppConfig from "../../config";
import AuthService from "../../adapters/service/auth";
import UserRepository from "../../adapters/repository/user";
import ExceptionsHelper from "../../helpers/exceptions";
import {DateTimeHelpers} from "../../helpers/commons/date_time";
import container from "../../infrastructure/container";

type UserServiceParams = {
    userRepository: any;
    authService: any
};

type UserServiceParamsRegisterUser = {
    email: string,
    username: string,
    password: string
}

type UserServiceParamsAuthenticateUser = {
    email: string,
    password: string
}


type UserServiceParamsRefreshUserToken = {
    refreshToken: string
}

type UserServiceParamsFetchProfileByAccessToken = {
    accessToken: string
}


export default class UserService {
    private userRepository?: any;
    private authService?: any;


    constructor(params: UserServiceParams) {
        this.userRepository = params.userRepository;
        this.authService = params.authService;
    }

    async registerUser(data: UserServiceParamsRegisterUser) {
        const {email, username, password} = data;
        CustomException.assert(
            !(await this.userRepository.findByEmail(email)),
            {
                status_code: HTTPResponseStatusCode.BAD_REQUEST,
                message: "Account with email already exists. Double check or sign in.",
                errors: ["account_exist_error"]
            }
        )
        CustomException.assert(
            !(await this.userRepository.findByUserName(username)),
            {
                status_code: HTTPResponseStatusCode.BAD_REQUEST,
                message: "Account with username already exists. Double check or sign in.",
                errors: ["account_exist_error"]
            }
        )
        const hashedPassword = await this.authService.hashPassword(password);
        const user = new User({email, username, password: hashedPassword})
        return await this.userRepository.create(user);

    }

    async authenticateUser(data: UserServiceParamsAuthenticateUser) {
        const {email, password} = data;
        const user = await this.userRepository.findByEmail(email);
        if (!user || !(await this.authService.comparePassword(password, user.password))) {
            throw new CustomException({
                status_code: HTTPResponseStatusCode.BAD_REQUEST,
                message: "Invalid credentials",
                errors: ["invalid_credentials"]
            });
        }
        return {
            access: this.authService.generateToken(user, "ACCESS", `${AppConfig.ACCESS_TOKEN_EXPIRY_SECS}s`),
            refresh: this.authService.generateToken(user, "REFRESH", `${AppConfig.REFRESH_TOKEN_EXPIRY_SECS}s`)
        };
    }

    async refreshUserToken(data: UserServiceParamsRefreshUserToken) {
        const {refreshToken} = data;
        const authService = container.resolve<AuthService>('authService');
        const userRepository = container.resolve<UserRepository>('userRepository');
        let decoded = ExceptionsHelper.executeCallbackSync({
            callback: () => authService.decodeToken(refreshToken)
        })
        if (decoded.is_success) {
            decoded = decoded.data
            if (decoded?.type === "REFRESH" && DateTimeHelpers.currentTimeInSecs() < decoded?.exp) {
                const user = await userRepository.findByEmail(decoded.email)
                if (user) {
                    return {
                        access: this.authService.generateToken(user, "ACCESS", `${AppConfig.ACCESS_TOKEN_EXPIRY_SECS}s`)
                    };
                }
            }
        }
        throw new CustomException({
            status_code: HTTPResponseStatusCode.BAD_REQUEST,
            message: "Invalid token",
            errors: ["invalid_token"]
        });
    }

    async fetchUserProfileByAccessToken(data: UserServiceParamsFetchProfileByAccessToken) {
        const {accessToken} = data;
        const authService = container.resolve<AuthService>('authService');
        const userRepository = container.resolve<UserRepository>('userRepository');
        let decoded = ExceptionsHelper.executeCallbackSync({
            callback: () => authService.decodeToken(accessToken)
        })
        if (decoded.is_success) {
            decoded = decoded.data
            if (decoded?.type === "ACCESS" && DateTimeHelpers.currentTimeInSecs() < decoded?.exp) {
                const user = await userRepository.findByEmail(decoded.email)
                if (user) {
                    return (new User(user as UserParams)).dataMini
                }
            }
        }
        throw new CustomException({
            status_code: HTTPResponseStatusCode.BAD_REQUEST,
            message: "Invalid token",
            errors: ["invalid_token"]
        });
    }

    async fetchMultipleUsers() {
        return await this.userRepository.fetchMultiple();
    }

    async fetchSingleUser(id: string) {
        return await this.userRepository.fetchSingle({_id: id}, false);
    }
}