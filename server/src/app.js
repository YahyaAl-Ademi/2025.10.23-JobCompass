import express from "express";
import userRouter from "./routes/user.js";
import jobsRouter from "./routes/job.js";
import travelRoutes from "./routes/travel.js";
import aiRouter from "./routes/ai.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

/**
 * We use /api/ at the start of every route!
 * As we also host our client code on heroku we want to separate the API endpoints.
 */
app.use("/api/users", userRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/travel", travelRoutes);
app.use("/api/ai", aiRouter);

app.use(errorHandler);

export default app;
