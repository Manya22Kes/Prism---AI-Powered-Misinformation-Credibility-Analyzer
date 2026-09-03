import ActivityEvent from "../models/ActivityEvent.js";

/**
 * Logs an activity event to the database.
 * This function is observational and safely catches its own errors so it never
 * breaks the underlying operation that triggered it.
 *
 * @param {Object} payload
 * @param {string} payload.eventType
 * @param {string} payload.entityType
 * @param {string} [payload.entityId]
 * @param {string} payload.title
 * @param {string} [payload.description]
 * @param {Object} [payload.metadata]
 */
export const logActivity = async (payload) => {
  try {
    await ActivityEvent.create(payload);
  } catch (error) {
    // We swallow the error and log it so that underlying logic isn't interrupted
    console.error(`[ActivityService] Failed to log activity ${payload?.eventType}:`, error.message);
  }
};
