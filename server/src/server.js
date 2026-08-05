import dotenv from 'dotenv'
import app from "./app.js";

dotenv.config()

const PORT = process.env.PORT

const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server Running on PORT: ${PORT}`)
        })
    } catch (error) {
        console.log(`Server Startup Error: ${error.message}`)
        process.exit(1)
    }
}

startServer()