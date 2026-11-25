import { Router } from "express";
import { handleAnalyze, fetchHistory } from "../controllers/analyze.controller";

const router = Router();
router.post("/", handleAnalyze);
router.get("/history", fetchHistory);

export default router;
