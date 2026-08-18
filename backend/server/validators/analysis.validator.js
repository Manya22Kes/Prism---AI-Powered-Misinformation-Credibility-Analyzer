const { z } = require("zod");

const createAnalysisSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  uploadedFile: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export { createAnalysisSchema };
