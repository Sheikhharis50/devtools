import { useEffect, useState, useCallback, useRef } from "react";
import type { CountryType } from "@/components/WorldTime/index.type";
import type { SelectedRates } from "@/config/storage";
import { STORAGE, type AppSettings } from "@/config/storage";
import moment from "moment";
import { fetchRates } from "@/api/currency";

interface UseWorldRatesReturn {
  selectedRates: SelectedRates;
  synced: boolean;
  syncing: boolean;
  refreshRates: () => Promise<void>;
  getRate: (from: string, to: string) => number;
}

// Internal helper functions for rates management
const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(STORAGE);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error reading settings:", error);
    return {};
  }
};

const ratesToStorage = (selectedRates: SelectedRates): void => {
  try {
    const current = getSettings();
    const updated: AppSettings = {
      world_time: {
        selected_countries: current.world_time?.selected_countries || [],
      },
      world_rates: {
        selected_rates: selectedRates,
      },
    };
    localStorage.setItem(STORAGE, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving rates to storage:", error);
  }
};

// Helper function to fetch currency rates
async function fetchCurrency(
  countries: CountryType[],
  existingRates: SelectedRates = {},
  forceRefresh: boolean = false,
) {
  const selectedRates: SelectedRates = {};
  let synced = true;

  const uniqueCurrencies = Array.from(
    new Set(countries.map((c) => c.currency.code.toUpperCase())),
  );

  const results = await Promise.all(
    uniqueCurrencies.map(async (base) => {
      const existingExpiry = existingRates[base]?.expired_at;
      const hoursRemaining = existingExpiry
        ? moment(existingExpiry).diff(moment(), "hours")
        : 0;

      // Only fetch if forceRefresh OR less than 3 hours remaining OR no existing data
      const shouldFetch = forceRefresh || !existingExpiry || hoursRemaining < 3;

      let rates;
      let lastSynced = true;

      if (shouldFetch) {
        const result = await fetchRates(base, uniqueCurrencies);
        rates = result.rates;
        lastSynced = result.lastSynced !== null;

        if (!lastSynced) synced = false;
      } else {
        // Reuse existing rates without API call
        rates = existingRates[base]?.rates || {};
      }

      // Update expired_at logic
      const keepExpiry =
        !forceRefresh && existingExpiry && moment().isBefore(existingExpiry);

      return {
        base,
        rates,
        expired_at: keepExpiry
          ? existingExpiry
          : moment().add(24, "hours").valueOf(),
      };
    }),
  );

  results.forEach(({ base, rates, expired_at }) => {
    selectedRates[base] = {
      rates,
      expired_at,
    };
  });

  return { selectedRates, synced };
}

// Helper function to check if rates need updating
function rateUpdate(
  countries: CountryType[],
  selectedRates: SelectedRates,
): boolean {
  if (!countries || countries.length === 0) return false;
  if (!selectedRates || Object.keys(selectedRates).length === 0) return true;

  const uniqueCurrencies = Array.from(
    new Set(countries.map((c) => c.currency.code.toUpperCase())),
  );

  return !uniqueCurrencies.every((currency) => {
    const cached = selectedRates[currency];
    return (
      cached &&
      cached.rates &&
      Object.keys(cached.rates).length > 0 &&
      moment().isBefore(cached.expired_at)
    );
  });
}

export const useWorldRates = (
  selectedCountries: CountryType[],
): UseWorldRatesReturn => {
  const [selectedRates, setSelectedRates] = useState<SelectedRates>(() => {
    const settings = getSettings();
    return settings.world_rates?.selected_rates || {};
  });
  const [synced, setSynced] = useState<boolean>(true);
  const [syncing, setSyncing] = useState(false);

  const isUpdatingRef = useRef(false);

  // Refresh rates manually (forces new fetch and updates expired_at)
  const refreshRates = useCallback(async () => {
    if (syncing || isUpdatingRef.current || !selectedCountries.length) return;

    try {
      setSyncing(true);
      isUpdatingRef.current = true;

      // Pass true to force refresh all expired_at timestamps
      const { selectedRates: newRates, synced: newSynced } =
        await fetchCurrency(selectedCountries, selectedRates, true);

      ratesToStorage(newRates);
      setSelectedRates(newRates);
      setSynced(newSynced);
    } catch (err) {
      console.error("Failed to refresh rates", err);
      setSynced(false);
    } finally {
      setSyncing(false);
      isUpdatingRef.current = false;
    }
  }, [selectedCountries, selectedRates, syncing]);

  // Auto-update rates when needed
  useEffect(() => {
    const updateRatesIfNeeded = async () => {
      if (!selectedCountries.length || isUpdatingRef.current) return;

      const needsUpdate = rateUpdate(selectedCountries, selectedRates);

      if (!needsUpdate) {
        setSynced(true);
        return;
      }

      try {
        isUpdatingRef.current = true;
        setSynced(false);

        // Pass false to preserve existing expired_at for currencies that haven't expired
        const { selectedRates: newRates, synced: newSynced } =
          await fetchCurrency(selectedCountries, selectedRates, false);

        ratesToStorage(newRates);
        setSelectedRates(newRates);
        setSynced(newSynced);
      } catch (err) {
        console.error("Failed to auto-update rates", err);
        setSynced(false);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    updateRatesIfNeeded();
  }, [selectedCountries, selectedRates]);

  // Get conversion rate between two currencies
  const getRate = useCallback(
    (from: string, to: string): number => {
      if (from === to) return 1;

      const fromUpper = from.toUpperCase();
      const toUpper = to.toUpperCase();

      const fromRates = selectedRates[fromUpper]?.rates;
      if (fromRates && typeof fromRates[toUpper] === "number") {
        return fromRates[toUpper];
      }

      const toRates = selectedRates[toUpper]?.rates;
      if (
        toRates &&
        typeof toRates[fromUpper] === "number" &&
        toRates[fromUpper] !== 0
      ) {
        return 1 / toRates[fromUpper];
      }
      return 0;
    },
    [selectedRates],
  );

  return {
    selectedRates,
    synced,
    syncing,
    refreshRates,
    getRate,
  };
};
