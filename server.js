import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDB } from "./src/config/database.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

start();
