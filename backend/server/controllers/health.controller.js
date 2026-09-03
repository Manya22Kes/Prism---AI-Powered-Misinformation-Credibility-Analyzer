import mongoose from "mongoose";

export const checkSystemHealth = async () => {
  const health = {
    status: "operational",
    version: "4.2.0",
    appVersion: "4.2",
    timestamp: new Date().toISOString(),
    services: {
      api: { 
        status: "operational",
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      },
      database: { status: "unknown" },
      aiProvider: { status: "unknown" },
      analysis: { 
        status: "operational",
        message: "Multi-modal processing ready (Text, URL, PDF, Image)"
      },
      batchAnalysis: { 
        status: "operational",
        message: "Queue system ready and accepting jobs"
      }
    }
  };

  let statusCode = 200;

  // 1. Check Database
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const start = performance.now();
      await mongoose.connection.db.admin().ping();
      const latency = Math.round(performance.now() - start);
      
      health.services.database = {
        status: "operational",
        latencyMs: latency
      };
    } else {
      health.services.database = { status: "degraded", error: "Database disconnected" };
      health.status = "degraded";
      statusCode = 503;
    }
  } catch (dbError) {
    health.services.database = { status: "degraded", error: dbError.message };
    health.status = "degraded";
    statusCode = 503;
  }

  // 2. Check AI Provider
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.length > 10 && !geminiKey.includes("your_api_key")) {
    const activeModel = (process.env.GEMINI_MODEL && !process.env.GEMINI_MODEL.includes("3.5")) 
      ? process.env.GEMINI_MODEL 
      : "gemini-3.7-flash";
    health.services.aiProvider = {
      status: "operational",
      provider: activeModel,
      message: "Configured — availability verified during analysis"
    };
  } else {
    health.services.aiProvider = {
      status: "degraded",
      error: "Missing or invalid API key configuration"
    };
    if (health.status === "operational") health.status = "degraded";
  }

  return { health, statusCode };
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const { health, statusCode } = await checkSystemHealth();
    res.setHeader('Cache-Control', 'no-store');
    res.status(statusCode).json(health);
  } catch (error) {
    next(error);
  }
};
