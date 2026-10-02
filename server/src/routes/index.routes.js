import express from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import projectRouter from "./project.routes.js";
import reviewRouter from "./review.routes.js";
import snapshotRouter from "./snapshot.routes.js";
import reviewHistoryRouter from "./reviewHistory.routes.js";
import notificationRouter from "./notification.routes.js";
import searchRouter from "./search.routes.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use("/projects", projectRouter);

router.use("/projects/:projectId/reviews", reviewRouter);

router.use("/projects/:projectId/snapshots", snapshotRouter);

router.use("/reviews", reviewHistoryRouter);

router.use("/notifications", notificationRouter);

router.use("/search", searchRouter);

export default router;
