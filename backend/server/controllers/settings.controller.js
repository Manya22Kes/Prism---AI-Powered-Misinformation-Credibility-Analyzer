import UserSettings from "../models/UserSettings.js";

// Helper to ensure singleton
const getOrCreateSettings = async () => {
  let settings = await UserSettings.findOne({ isSingleton: true });
  if (!settings) {
    settings = await UserSettings.create({ isSingleton: true });
  }
  return settings;
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { theme, reducedMotion, autoRefresh, autoRefreshInterval, resetToDefaults } = req.body;
    let settings = await getOrCreateSettings();

    if (resetToDefaults) {
      settings.theme = "dark";
      settings.reducedMotion = false;
      settings.autoRefresh = true;
      settings.autoRefreshInterval = 60;
    } else {
      if (["dark", "light"].includes(theme)) settings.theme = theme;
      if (typeof reducedMotion === "boolean") settings.reducedMotion = reducedMotion;
      if (typeof autoRefresh === "boolean") settings.autoRefresh = autoRefresh;
      if ([15, 30, 60].includes(autoRefreshInterval)) settings.autoRefreshInterval = autoRefreshInterval;
    }

    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};
