import mongoose from 'mongoose';

export const validateObjectId = (req, res, next) => {
  for (const [key, value] of Object.entries(req.params)) {
    if (key.toLowerCase().endsWith('id')) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ID format for ${key}`,
        });
      }
    }
  }
  next();
};

export default validateObjectId;
