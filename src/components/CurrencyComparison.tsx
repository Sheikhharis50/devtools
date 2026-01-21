import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { CountryType } from "./WorldTime/index.type";
import { AddCountryModal } from "./WorldTime/AddCountryModal";
import { formatCommas } from "@/utils/functions";
import { DEFAULT_COUNTRIES } from "@/config/countries";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import ReactCountryFlag from "react-country-flag";
import { useWorldRates } from "@/hooks/useWroldRates";

const Rates = () => {
  const [selectedCountries, setSelectedCountries] = useLocalStorage<
    CountryType[]
  >("world_time.selected_countries", DEFAULT_COUNTRIES);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use the custom hook for all rates logic
  const { synced, syncing, refreshRates, getRate } =
    useWorldRates(selectedCountries);

  const addCountry = (country: CountryType) => {
    if (selectedCountries.some((c) => c.timezone === country.timezone)) return;
    setSelectedCountries([...selectedCountries, country]);
  };

  const removeCountry = (timezone: string) => {
    setSelectedCountries(
      selectedCountries.filter((c) => c.timezone !== timezone),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 ml-[4%]">
            Rates Comparison
          </h1>
          <div className="flex gap-2">
            <button
              onClick={refreshRates}
              disabled={syncing}
              className="inline-flex items-center hover:cursor-pointer gap-2 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md shadow-md border transition-all disabled:opacity-60"
              style={{
                backgroundColor: synced
                  ? "rgba(220, 252, 231, 0.6)"
                  : "rgba(254, 226, 226, 0.6)",
                color: synced ? "#059669" : "#dc2626",
                borderColor: synced ? "#bbf7d0" : "#fecaca",
              }}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  syncing ? "animate-spin" : "animate-pulse"
                }`}
                style={{
                  backgroundColor: synced ? "#059669" : "#dc2626",
                }}
              />
              {syncing ? "Syncing..." : synced ? "Sync" : "Unsync"}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              Add Country
            </button>
          </div>
        </div>
      </div>

      {selectedCountries && selectedCountries.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 border-r-2 border-gray-200 min-w-[180px] shadow-sm">
                    Currency
                  </th>
                  {selectedCountries.map((country: CountryType) => (
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
                {selectedCountries.map((r: CountryType) => (
                  <tr key={r.timezone} className="border-b hover:bg-blue-50">
                    <td className="sticky left-0 bg-white px-4 py-3 border-r font-semibold">
                      <div className="flex flex-col">
                        <span>{r.name}</span>
                        <span className="text-xs text-gray-500 uppercase">
                          {r.currency.code}
                        </span>
                      </div>
                    </td>

                    {selectedCountries.map((colCountry: CountryType) => {
                      const col = colCountry.currency;
                      const value = getRate(r.currency.code, col.code);
                      return (
                        <td
                          key={colCountry.timezone}
                          className="px-4 py-3 text-center"
                        >
                          {formatCommas(value)}
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
  );
};

export default Rates;
