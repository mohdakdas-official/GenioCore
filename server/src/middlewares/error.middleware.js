import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
    logger.error(err)

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        })
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
        })
    })
}

export default errorHandler