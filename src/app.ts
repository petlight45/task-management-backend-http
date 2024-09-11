import express from "express";
import {scopePerRequest} from 'awilix-express';
import cors from 'cors';
import bodyParser from "body-parser"
import {UserRouter} from "./ports/routers/user";
import {HTTPResponseStatusCode} from "./helpers/definitions/response";
import {exceptionHandlerMiddleware} from "./ports/middlewares/exception";
import {JWTAuthenticationMiddleware} from "./ports/middlewares/authentication";
import {TaskRouter} from "./ports/routers/task";
import container from "./infrastructure/container";
import {morganMiddleware} from "./ports/middlewares/logger";
import {LoggerPort} from "./ports/logger";
import {connectToDatabase} from "./infrastructure/db/mongoose";


//Initializing basic variables
const AppConfig = container.resolve("appConfig")
export const serverPort = AppConfig.SERVER_PORT
export const logger: LoggerPort = container.resolve<LoggerPort>("logger")
//Initializing the express app
const app = express()
// MiddleWares
app.use(cors());
app.use(scopePerRequest(container));
app.use(morganMiddleware(logger))
app.use(bodyParser.urlencoded({extended: false}), bodyParser.json())

app.use(JWTAuthenticationMiddleware)
//Routes
app.use(`/v${AppConfig.API_VERSION}/api/user`, UserRouter)
app.use(`/v${AppConfig.API_VERSION}/api/task`, TaskRouter)


app.use((req: express.Request, res: express.Response) => {
    // @ts-ignore
    res.status(HTTPResponseStatusCode.NOT_FOUND).json({
        message: "The endpoint you tried to access does not exist on the server",
        errors: ["resource_not_found"]
    })
})

app.use(exceptionHandlerMiddleware)

export const startApp = async (): Promise<void> => {
    const messageQueue = container.resolve('messageQueue');
    await messageQueue.connectAndInitializeChannel().catch((err) => logger.error(err as string | Error)).then((res) => logger.info("Successfully connected to message queue"))
    await connectToDatabase(logger);

};
export default app;