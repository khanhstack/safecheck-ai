import { Request, Response } from "express";
import {
  analyzeProduct,
  getHistoryBySession,
} from "../services/analyzer.service";

export const handleAnalyze = async (req: Request, res: Response) => {
  try {
    const result = await analyzeProduct(req.body);
    res.json(result);
  } catch (error: any) {
    console.error("Lỗi phân tích:", error);
    res
      .status(500)
      .json({ error: error.message || "Lỗi khi phân tích sản phẩm" });
  }
};

export const fetchHistory = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) return res.status(400).json({ error: "Thiếu sessionId" });
    const history = await getHistoryBySession(sessionId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tải lịch sử tra cứu" });
  }
};
