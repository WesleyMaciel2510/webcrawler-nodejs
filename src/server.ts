import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import movieRoutes from "./routes/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", movieRoutes);

// Health check endpoint
app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: "Something broke!",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
