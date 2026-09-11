import express from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import projectRouter from "./project.routes.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use("/projects", projectRouter);

export default router;
