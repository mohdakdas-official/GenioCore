import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorHandler from './middlewares/error.middleware.js'
import ApiError from "./utils/ApiError.js";

const app = express()

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_ORIGIN : 'http://localhost:5173',
    withCredentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to NeuAspire API",
        success: true
    })
})
app.get('/error', (req, res) => {
    throw new ApiError(400, "This is a test error")
})

app.use(errorHandler)

export default app;