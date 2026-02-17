import express from "express";
import aiAssistSkills from "../controllers/aiAssistSkills.js";

const router = express.Router();

router.post("/assist-skills", aiAssistSkills);

export default router;
