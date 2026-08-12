import mongoose from 'mongoose';
import logger from './logger.js';


const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        logger.info(`MongoDB Connected`)
    } catch (error) {
        logger.error(`Failed to connect MongoDB: ${error}`)
        process.exit(1);
    }
}

export default connectDB