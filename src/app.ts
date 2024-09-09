import morgan from "morgan"
import express from "express";
import {scopePerRequest} from 'awilix-express';
import cors from 'cors';
import bodyParser from "body-parser"
import AppConfig from "./config";
import {UserRouter} from "./ports/routers/user";
import {HTTPResponseStatusCode} from "./helpers/definitions/response";
import {exceptionHandlerMiddleware} from "./ports/middlewares/exception";
import {JWTAuthenticationMiddleware} from "./ports/middlewares/authentication";
import {TaskRouter} from "./ports/routers/task";
import container from "./infrastructure/container";

AppConfig.initiate()

//Initializing basic variables
const serverPort = AppConfig.SERVER_PORT
//Initializing the express app
const app = express()
// MiddleWares
app.use(cors());
app.use(scopePerRequest(container));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
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

const messageQueue = container.resolve('messageQueue');
messageQueue.connectAndInitializeChannel().catch(console.error)

//Listening
app.listen(serverPort, () => {
    console.log(`Server listening on port ${serverPort}`)
})