import crypto from "crypto";

export const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

export const generateRandomToken = (bytes = 32) => {
    return crypto
        .randomBytes(bytes)
        .toString("hex");
};