import dotenv from 'dotenv'
import app from "./app.js";
import connectDB from './config/db.js';

dotenv.config()

const PORT = process.env.PORT

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server Running on PORT: ${PORT}`)
        })
    } catch (error) {
        console.log(`Failed to start server: ${error}`)
        process.exit(1)
    }
}

startServer()