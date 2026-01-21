/**
 * Centralized localStorage with a single "settings" key
 * All application data is stored within this single key
 */

export const STORAGE = "settings";

export interface CurrencyRates {
  [currency: string]: number;
}

export interface StoredCurrencyRates {
  rates: CurrencyRates;
  expired_at: number;
}

export interface SelectedRates {
  [currency: string]: StoredCurrencyRates;
}

export interface WorldTimeSettings {
  selected_countries?: any[];
}

export interface WorldRatesSettings {
  selected_rates?: SelectedRates;
}

export interface AppSettings {
  world_time?: WorldTimeSettings;
  world_rates?: WorldRatesSettings;
}
