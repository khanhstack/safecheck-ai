import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import profileRoutes from "./routes/profile.routes";
import analyzeRoutes from "./routes/analyze.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.use("/api/profile", profileRoutes);
app.use("/api/analyze", analyzeRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "SafeCheck AI Backend is running!" });
});

app.listen(PORT, () => {
  console.log(`Backend Server đang chạy tại http://localhost:${PORT}`);
});
