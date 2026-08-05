import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

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

export default app;