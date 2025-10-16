import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
  origin: [
    'https://todo-fe-lac-pi.vercel.app'
  ],
  credentials: true
}));
console.log(`fix cors`);

app.options('*', cors());

// Minimal request logger for debugging (removed verbose headers/body logs)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running!", timestamp: new Date().toISOString() });
});

app.use("/api", router);
app.use(errorHandler);

export default app;
