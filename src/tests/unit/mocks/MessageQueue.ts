import {MessageQueuePort} from "../../../ports/message_queue";

export const mockMessageQueue: jest.Mocked<MessageQueuePort> = {
    sendMessage: async (queueName: string, message: any) => null,
    connectAndInitializeChannel: async () => null
};