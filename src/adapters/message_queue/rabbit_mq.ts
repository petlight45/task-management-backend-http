import amqp, {Channel} from "amqplib";
import {MessageQueuePort} from "../../ports/message_queue";

type RabbitMQAdapterParams = {
    appConfig: any
}

export class RabbitMQAdapter implements MessageQueuePort {
    private appConfig;
    channel: Channel | null;


    constructor(params: RabbitMQAdapterParams) {
        this.appConfig = params.appConfig;
        this.channel = null;
    }

    async connectAndInitializeChannel(): Promise<void> {
        const connection = await amqp.connect(this.appConfig.RABBIT_MQ_URL);
        this.channel = await connection.createChannel();
    }

    async sendMessage(queueName: string, message: any) {
        await this.channel?.assertQueue(queueName)
        await this.channel?.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    }
}
