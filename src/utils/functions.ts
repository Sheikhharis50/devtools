import {
  STORAGE,
  type AppSettings,
  type WorldRatesSettings,
} from "@/config/storage";

export const updateRates = (data: Partial<WorldRatesSettings>): void => {
  const current = getSettings();
  updateSettings({
    world_rates: {
      selected_rates: current.world_rates?.selected_rates || {},
      ...data,
    },
  });
};

export const formatCommas = (num: number): string => {
  if (!num || num === 0) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(STORAGE);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error reading settings:", error);
    return {};
  }
};

export const updateSettings = (updates: Partial<AppSettings>): void => {
  try {
    const current = getSettings();
    const updated: AppSettings = {
      world_time: {
        selected_countries: current.world_time?.selected_countries || [],
        ...updates.world_time,
      },
      world_rates: {
        selected_rates: current.world_rates?.selected_rates || {},
        ...updates.world_rates,
      },
    };

    localStorage.setItem(STORAGE, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating settings:", error);
  }
};
