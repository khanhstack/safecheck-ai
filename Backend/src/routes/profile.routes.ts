import { Router } from "express";
import { fetchProfile, saveProfile } from "../controllers/profile.controller";

const router = Router();
router.get("/", fetchProfile);
router.post("/", saveProfile);

export default router;
