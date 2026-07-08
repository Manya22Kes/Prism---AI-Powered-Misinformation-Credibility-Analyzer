const express = require("express");
const {
  createAnalysis,
  getAnalyses,
} = require("../controllers/analysis.controller");

const router = express.Router();

router.post("/", createAnalysis);
router.get("/", getAnalyses);

module.exports = router;
