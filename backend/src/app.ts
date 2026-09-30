import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import requestRouter from "./routes/requests";
import workspaceRouter from "./routes/workspaces";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.json({
    message: "Client Request Desk API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/requests", requestRouter);
app.use("/api/workspaces", workspaceRouter);

// Unknown route 404 fallback
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
