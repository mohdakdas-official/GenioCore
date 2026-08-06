import dotenv from 'dotenv'
import app from "./app.js";
import connectDB from './config/db.js';
import logger from './config/logger.js';

dotenv.config()

const PORT = process.env.PORT

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            logger.info(`Server Running on PORT: ${PORT}`)
        })
    } catch (error) {
        // console.log(`Failed to start server: ${error}`)
        logger.error(`Failed to start server: ${error}`)
        process.exit(1)
    }
}

startServer()