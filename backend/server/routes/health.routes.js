import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: "1.0.0",
    provider: "gemini-2.5-flash",
  });
});

export default router;
