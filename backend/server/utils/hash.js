import crypto from "crypto";

export const generateHash = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};
