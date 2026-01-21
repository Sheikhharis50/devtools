import moment from "moment";
import type { StoredCurrencyRates } from "@/config/storage";
import { getSettings, updateSettings } from "@/utils/functions";

const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

export async function fetchRates(base: string, targetCurrencies: string[]) {
  const key = base.toUpperCase();
  const settings = getSettings();
  const cached = settings.world_rates?.selected_rates?.[key];

  if (cached && moment().isBefore(cached.expired_at)) {
    return {
      rates: cached.rates,
      lastSynced: moment(cached.expired_at).subtract(24, "hours").toDate(),
      expiredAt: cached.expired_at,
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/${base.toLowerCase()}.json`);
    if (!res.ok) throw new Error("Network response not ok");

    const data = await res.json();
    const apiRates = data[base.toLowerCase()];

    const normalizedRates: Record<string, number> = {};

    targetCurrencies.forEach((code) => {
      const lower = code.toLowerCase();
      const upper = code.toUpperCase();
      if (apiRates[lower] !== undefined) {
        normalizedRates[upper] = Number(apiRates[lower]);
      }
    });

    normalizedRates[key] = 1;

    const expiredAt = moment().add(24, "hours").valueOf();

    const ratesData: StoredCurrencyRates = {
      rates: normalizedRates,
      expired_at: expiredAt,
    };

    updateSettings({
      world_rates: {
        selected_rates: {
          ...settings.world_rates?.selected_rates,
          [key]: ratesData,
        },
      },
    });

    return { rates: normalizedRates, lastSynced: new Date(), expiredAt };
  } catch (err) {
    console.error("Currency fetch failed:", err);
    return {
      rates: cached?.rates || {},
      lastSynced: cached ? new Date() : null,
      expiredAt: cached?.expired_at,
    };
  }
}
