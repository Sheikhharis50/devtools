import { useState, useEffect } from "react";
import { Plus, X, Clock } from "lucide-react";
import { AddCountryModal } from "./WorldTime/AddCountryModal";
import type { CountryType } from "./WorldTime/index.type";
import { DEFAULT_COUNTRIES } from "@/config/countries";
import { STORAGE } from "@/config/storage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getTimeForTimezone, formatTime } from "@/utils/time";

const TimeComparison = () => {
  const [selectedCountries, setSelectedCountries] = useLocalStorage<
    CountryType[]
  >(STORAGE.WORLD_TIME.SELECTED_COUNTRIES, DEFAULT_COUNTRIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [currentTimes, setCurrentTimes] = useState<
    Record<string, { hours: number; minutes: number; seconds: number }>
  >({});

  // Update current times every second
  useEffect(() => {
    const updateTimes = () => {
      const times: Record<
        string,
        { hours: number; minutes: number; seconds: number }
      > = {};
      selectedCountries.forEach((country) => {
        times[country.timezone] = getTimeForTimezone(country.offset);
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [selectedCountries]);

  const addCountry = (country: CountryType) => {
    setSelectedCountries([...selectedCountries, country]);
  };

  const removeCountry = (timezone: string) => {
    setSelectedCountries(
      selectedCountries.filter((c) => c.timezone !== timezone)
    );
  };

  const getHourForCountry = (country: CountryType, hour: number) => {
    const baseOffset = selectedCountries[0]?.offset || 0;
    const diff = country.offset - baseOffset;
    return (hour + diff + 24) % 24;
  };

  const isCurrentHour = (country: CountryType, hour: number) => {
    const countryTime = currentTimes[country.timezone];
    if (!countryTime) return false;
    return countryTime.hours === hour;
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };

  if (selectedCountries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center py-16">
          <Clock size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No countries added yet
          </h3>
          <p className="text-gray-500 mb-6">
            Click the "Add Country" button to get started
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl mx-auto"
          >
            <Plus size={20} />
            Add Country
          </button>
        </div>
        <AddCountryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addCountry}
          selectedCountries={selectedCountries}
        />
      </div>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 ml-[3.5rem]">
            Time Comparison
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Add Country
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 border-r-2 border-gray-200 min-w-[120px] shadow-sm">
                    Time
                  </th>
                  {selectedCountries.map((country) => (
                    <th
                      key={country.timezone}
                      className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 min-w-[180px] relative"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-xl mb-[5px]">{country.icon}</span>
                        <span className="font-bold">{country.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        UTC {country.offset >= 0 ? "+" : ""}
                        {country.offset}
                      </div>
                      {currentTimes[country.timezone] && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          {formatTime(
                            currentTimes[country.timezone].hours,
                            currentTimes[country.timezone].minutes,
                            currentTimes[country.timezone].seconds
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => removeCountry(country.timezone)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                        aria-label="Remove country"
                      >
                        <X size={16} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr
                    key={hour}
                    className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      hoveredHour === hour ? "bg-blue-100" : ""
                    }`}
                    onMouseEnter={() => setHoveredHour(hour)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    <td
                      className={`sticky left-0 z-20 px-4 py-3 font-medium text-gray-700 border-r-2 border-gray-200 shadow-sm ${
                        hoveredHour === hour ? "bg-blue-100" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{formatHour(hour)}</span>
                        <span className="text-xs text-gray-400">
                          ({String(hour).padStart(2, "0")}:00)
                        </span>
                      </div>
                    </td>
                    {selectedCountries.map((country) => {
                      const countryHour = getHourForCountry(country, hour);
                      const isCurrent = isCurrentHour(country, countryHour);
                      const isHovered = hoveredHour === hour;

                      return (
                        <td
                          key={country.timezone}
                          className={`px-4 py-3 text-center border-r border-gray-100 transition-all ${
                            isCurrent
                              ? "bg-blue-200 font-bold text-blue-900"
                              : isHovered
                              ? "bg-blue-100"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-lg ${
                                isCurrent ? "text-blue-900" : "text-gray-700"
                              }`}
                            >
                              {formatHour(countryHour)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {String(countryHour).padStart(2, "0")}:00
                            </span>
                            {isCurrent && (
                              <span className="text-xs text-blue-700 mt-1 font-semibold">
                                NOW
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <span className="text-gray-700">Current Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span className="text-gray-700">Hovered Hour</span>
            </div>
            <div className="text-gray-500 text-xs">
              Hover over any hour row to see the corresponding times across all
              timezones
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddCountryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addCountry}
        selectedCountries={selectedCountries}
      />
    </div>
  );
};

export default TimeComparison;
