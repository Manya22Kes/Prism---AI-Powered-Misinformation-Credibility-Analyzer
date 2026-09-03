import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    isSingleton: {
      type: Boolean,
      default: true,
      unique: true,
      required: true,
    },
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },
    reducedMotion: {
      type: Boolean,
      default: false,
    },
    autoRefresh: {
      type: Boolean,
      default: true,
    },
    autoRefreshInterval: {
      type: Number,
      enum: [15, 30, 60],
      default: 60,
    }
  },
  {
    timestamps: true,
  }
);

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);
export default UserSettings;
