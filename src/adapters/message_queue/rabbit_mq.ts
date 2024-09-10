import amqp, {Channel} from "amqplib";
import {MessageQueuePort} from "../../ports/message_queue";
import {LoggerPort} from "../../ports/logger";

type RabbitMQAdapterParams = {
    appConfig: any
    logger: LoggerPort
}

export class RabbitMQAdapter implements MessageQueuePort {
    private appConfig;
    private logger;
    channel: Channel | null;


    constructor(params: RabbitMQAdapterParams) {
        this.appConfig = params.appConfig;
        this.logger = params.logger;
        this.channel = null;
    }

    async connectAndInitializeChannel(): Promise<void> {
        const connection = await amqp.connect(this.appConfig.RABBIT_MQ_URL);
        this.channel = await connection.createChannel();
    }

    async sendMessage(queueName: string, message: any) {
        await this.channel?.assertQueue(queueName)
        const message_ = JSON.stringify(message)
        if (this.channel?.sendToQueue(queueName, Buffer.from(message_))) {
            this.logger.info(`Message sent to queue ${queueName} - ${message_}`)
        }
    }
}
