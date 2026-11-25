import { Request, Response } from "express";
import {
  getProfileBySession,
  upsertProfile,
} from "../services/profile.service";

export const fetchProfile = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) return res.status(400).json({ error: "Thiếu sessionId" });
    const profile = await getProfileBySession(sessionId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tải hồ sơ sức khỏe" });
  }
};

export const saveProfile = async (req: Request, res: Response) => {
  try {
    const result = await upsertProfile(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lưu hồ sơ sức khỏe" });
  }
};
