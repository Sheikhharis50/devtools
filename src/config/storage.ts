/**
 * Centralized localStorage keys for the application
 * This ensures consistency and prevents key collisions
 */

export const STORAGE = {
  WORLD_TIME: {
    SELECTED_COUNTRIES: "worldTime.selectedCountries",
  },
  WORLD_RATES: {
    SELECTED_CURRENCIES: "worldRates.selectedCurrencies",
  },
} as const;
