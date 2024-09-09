import mongoose from 'mongoose';
import AppConfig from "../../config";

const connectToDatabase = async () => {
    try {
        await mongoose.connect(AppConfig.DATABASE_URL as string, {
            // @ts-ignore
            serverSelectionTimeoutMS: 30000, // 30 seconds
        });
        console.log('Successfully connected to the database');
    } catch (error) {
        console.error('Error connecting to the database', error);
        process.exit(1);
    }
};

export default connectToDatabase;
