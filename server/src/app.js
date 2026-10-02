import express, { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
import ApiError from "./utils/ApiError.js";
import router from "./routes/index.routes.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_ORIGIN
        : "http://localhost:5173",

    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(loggerMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to GenioCore API",
    success: true,
  });
});

app.use("/api/v1", router);

app.use(errorHandler);

export default app;
