import mongoose from 'mongoose';
import logger from './logger.js';


const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        // console.log(`✅ MongoDB Connected: ${connection.connection.host}`)
        logger.info(`MongoDB Connected`)
    } catch (error) {
        // console.error("❌ MongoDB Connection Failed:", error.message);
        logger.error(`Failed to connect MongoDB: ${error}`)
        process.exit(1);
    }
}

export default connectDB