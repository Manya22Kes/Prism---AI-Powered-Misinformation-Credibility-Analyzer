const Analysis = require("../models/Analysis");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

exports.createAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.create(req.body);
    res
      .status(201)
      .json(new ApiResponse(201, true, "Analysis created", analysis));
  } catch (error) {
    next(new ApiError(500, "Failed to create analysis", error.message));
  }
};

exports.getAnalyses = async (req, res, next) => {
  try {
    const analyses = await Analysis.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json(new ApiResponse(200, true, "Analyses fetched", analyses));
  } catch (error) {
    next(new ApiError(500, "Failed to fetch analyses", error.message));
  }
};
