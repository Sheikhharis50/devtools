import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { CountryType, CurrencyType } from "./WorldTime/index.type";
import { AddCountryModal } from "./WorldTime/AddCountryModal";
import { STORAGE } from "@/config/storage";
import { formatWithCommas } from "@/utils/functions";
import { DEFAULT_COUNTRIES } from "@/config/countries";
import ReactCountryFlag from "react-country-flag";
import { fetchCurrencyRates } from "@/api/currency";

const Rates = () => {
  const [selectedCountries, setSelectedCountries] = useLocalStorage<
    CountryType[]
  >(STORAGE.WORLD_TIME.SELECTED_COUNTRIES, DEFAULT_COUNTRIES);

  const [rates, setRates] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState<boolean>(false);

  const displayCurrencies: CurrencyType[] = selectedCountries
    .map((country) => country.currency)
    .filter(
      (currency, index, self) =>
        currency && self.findIndex((c) => c?.code === currency.code) === index
    ) as CurrencyType[];

  const base = displayCurrencies[0]?.code?.toLowerCase();

  useEffect(() => {
    if (!base) return;

    const fetchRates = async () => {
      if (!base) return;

      setLoading(true);

      const { rates: fetchedRates, synced: isSynced } =
        await fetchCurrencyRates(base);

      setRates(fetchedRates);
      setSynced(isSynced);

      setLoading(false);
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
  const removeCountry = (timezone: string) => {
    setSelectedCountries(
      selectedCountries.filter((c) => c.timezone !== timezone)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 ml-[4%]">
            Currency Comparison
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md shadow-md border transition-colors ${
                synced
                  ? "bg-green-100/60 text-green-800 border-green-200"
                  : "bg-red-100/60 text-red-800 border-red-200"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  synced ? "bg-green-600 animate-pulse" : "bg-red-600"
                }`}
              />

              {synced ? "Synced" : "Unsynced"}
            </span>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              Add Country
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-600">
            Loading exchange rates...
          </div>
        )}

        {selectedCountries.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 border-r-2 border-gray-200 min-w-[180px] shadow-sm">
                      Currency
                    </th>
                    {selectedCountries.map((country) => (
                      <th
                        key={country.timezone}
                        className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 min-w-[280px] relative"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="flex flex-col">
                            <span className="flex gap-1 items-center">
                              <ReactCountryFlag
                                countryCode={country.code}
                                svg
                                style={{ width: "1em", height: "1.5em" }}
                                title={country.name}
                              />
                              <span className="text-lg font-semibold">
                                {country.name}
                              </span>
                            </span>
                            <span className="text-gray-500 uppercase">
                              {country.currency.code}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCountry(country.timezone)}
                          className="absolute top-0 right-0 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                          aria-label="Remove country"
                        >
                          <X size={16} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {selectedCountries.map((r) => (
                    <tr key={r.timezone} className="border-b hover:bg-blue-50">
                      <td className="sticky left-0 bg-white px-4 py-3 border-r font-semibold">
                        <div className="flex flex-col">
                          <span>{r.name}</span>
                          <span className="text-xs text-gray-500 uppercase">
                            {r.currency.code}
                          </span>
                        </div>
                      </td>

                      {selectedCountries.map((colCountry) => {
                        const col = colCountry.currency;
                        const value = getRate(r.currency.code, col.code);
                        return (
                          <td
                            key={colCountry.timezone}
                            className="px-4 py-3 text-center"
                          >
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
