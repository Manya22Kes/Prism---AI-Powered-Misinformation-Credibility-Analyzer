import express from "express";
import { getMissionControlData } from "../controllers/missionControl.controller.js";

const router = express.Router();

router.get("/", getMissionControlData);

export default router;
