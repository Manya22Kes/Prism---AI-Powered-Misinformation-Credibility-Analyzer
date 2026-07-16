import mongoose from "mongoose";

const errorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

export default errorSchema;
