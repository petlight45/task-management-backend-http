import {Channel} from "amqplib";

export interface MessageQueuePort {
    channel: Channel | null

    connectAndInitializeChannel(): Promise<void>;

    sendMessage(queueName: string, message: any): Promise<void>;
}
