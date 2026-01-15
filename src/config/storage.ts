/**
 * Centralized localStorage keys for the application
 * This ensures consistency and prevents key collisions
 */

export const STORAGE = {
  WORLD_TIME: {
    SELECTED_COUNTRIES: "SELECTED_COUNTRIES",
  },
  WORLD_RATES: {
    SELECTED_CURRENCIES: "SELECTED_CURRENCIES",
  },
} as const;
