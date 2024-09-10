import mongoose from 'mongoose';
import AppConfig from "../../config";
import {LoggerPort} from "../../ports/logger";

const connectToDatabase = async (logger: LoggerPort) => {
    try {
        await mongoose.connect(AppConfig.DATABASE_URL as string, {
            // @ts-ignore
            serverSelectionTimeoutMS: 30000, // 30 seconds
        });
        logger.info('Successfully connected to the database');
    } catch (error) {
        logger.error("Error connecting to database")
        logger.error(error as string | Error);
    }
};

export default connectToDatabase;
