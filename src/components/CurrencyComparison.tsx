import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { CountryType, CurrencyType } from "./WorldTime/index.type";
import { AddCountryModal } from "./WorldTime/AddCountryModal";
import { STORAGE } from "@/config/storage";
import {
  formatWithCommas,
  getWithExpiry,
  setWithExpiry,
} from "@/utils/functions";
import { DEFAULT_COUNTRIES } from "@/config/countries";

const Rates = () => {
  const [selectedCountries, setSelectedCountries] = useLocalStorage<
    CountryType[]
  >(STORAGE.WORLD_TIME.SELECTED_COUNTRIES, DEFAULT_COUNTRIES);

  const [rates, setRates] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayCurrencies: CurrencyType[] = selectedCountries
    .map((country) => country.currency)
    .filter(
      (currency, index, self) =>
        currency && self.findIndex((c) => c?.code === currency.code) === index
    ) as CurrencyType[];

  const base = displayCurrencies[0]?.code?.toLowerCase();

  const fetchedBaseRef = useRef<string | null>(null);

  useEffect(() => {
    if (!base) return;

    const cacheKey = `CURRENCY_RATES_${base}`;

    if (fetchedBaseRef.current === base) return;
    fetchedBaseRef.current = base;

    const fetchRates = async () => {
      setLoading(true);

      const cached = getWithExpiry<Record<string, number>>(cacheKey);
      if (cached) {
        console.log("Using cached rates for:", base);
        setRates(cached);
        setLoading(false);
        return;
      }

      console.log("Fetching API for base:", base);

      try {
        const res = await fetch(
          `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`
        );

        const data = await res.json();

        const allRates = data[base];

        setRates(allRates);
        setWithExpiry(cacheKey, allRates);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [base]);

  const addCountry = (country: CountryType) => {
    if (selectedCountries.some((c) => c.timezone === country.timezone)) return;
    setSelectedCountries([...selectedCountries, country]);
  };

  const getRate = (from: string, to: string) => {
    if (from === to) return 1;

    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    if (!rates) return 0;

    if (fromLower === base) {
      return rates[toLower] || 0;
    }

    if (toLower === base) {
      return rates[fromLower] ? 1 / rates[fromLower] : 0;
    }

    if (rates[fromLower] && rates[toLower]) {
      return rates[toLower] / rates[fromLower];
    }

    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 ml-[3.5rem]">
            Currency Comparison
          </h1>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            Add Country
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-gray-600">
            Loading exchange rates...
          </div>
        )}

        {/* Table */}
        {selectedCountries.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 border-r-2 border-gray-200 min-w-[120px] shadow-sm">
                      Currency
                    </th>
                    {selectedCountries.map((country) => (
                      <th
                        key={country.timezone}
                        className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 min-w-[180px] relative"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-lg font-semibold">
                            {country.name}
                          </span>
                          <span className=" uppercase text-gray-500">
                            {country.currency.code}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {displayCurrencies.map((row) => (
                    <tr key={row.code} className="border-b hover:bg-blue-50">
                      <td className="sticky left-0 bg-white px-4 py-3 border-r font-semibold">
                        <div className="flex flex-col">
                          <span>{row.name}</span>
                          <span className="text-xs text-gray-500 uppercase">
                            {row.code}
                          </span>
                        </div>
                      </td>

                      {selectedCountries.map((colCountry) => {
                        const col = colCountry.currency;
                        const value = getRate(row.code, col.code);
                        return (
                          <td
                            key={colCountry.timezone}
                            className="px-4 py-3 text-center"
                          >
                            {col.symbol}
                            {formatWithCommas(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            No countries added yet. Click <b>Add Country</b> to begin.
          </div>
        )}

        {/* Add Country Modal */}
        <AddCountryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addCountry}
          selectedCountries={selectedCountries}
        />
      </div>
    </div>
  );
};

export default Rates;
