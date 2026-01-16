import { setWithExpiry, getWithExpiry } from "@/utils/functions";

const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

export async function fetchCurrencyRates(base: string) {
  const cacheKey = `CURRENCY_RATES_${base}`;
  const cached = getWithExpiry<Record<string, number>>(cacheKey);

  // ✅ Return cached data if valid
  if (cached) {
    return { rates: cached, synced: true };
  }

  try {
    const res = await fetch(`${BASE_URL}/${base}.json`);
    if (!res.ok) throw new Error("Network response not ok");

    const data = await res.json();
    const allRates = data?.[base];

    if (!allRates) {
      throw new Error("Invalid API response structure");
    }

    setWithExpiry(cacheKey, allRates);

    return { rates: allRates, synced: true };
  } catch (err) {
    console.error("Currency fetch failed:", err);
    return { rates: {}, synced: false };
  }
}
