import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import BlacklistedToken from "../models/blacklisted-token.model.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        throw new ApiError(
            401,
            "Authentication token is required"
        );
    }

    const accessToken = authHeader.split(" ")[1];

    try {
        const decodedToken = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_SECRET
        );

        const blacklistedToken =
            await BlacklistedToken.findOne({
                jti: decodedToken.jti,
            });

        if (blacklistedToken) {
            throw new ApiError(
                401,
                "Access token has been revoked"
            );
        }

        req.user = decodedToken;

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            401,
            "Invalid or expired access token"
        );
    }
};

export default authMiddleware;