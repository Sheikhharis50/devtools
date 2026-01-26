import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { CountryType } from "@/components/WorldTime/index.type";
import { useWorldRates } from "@/hooks/useWroldRates";
import { formatCommas } from "@/utils/functions";
import ReactCountryFlag from "react-country-flag";
import { RateIndicator } from "../RateIndicator";

interface CurrencyRatesWidgetProps {
  selectedCountries: CountryType[];
}

export default function RateWidget({
  selectedCountries,
}: CurrencyRatesWidgetProps) {
  const { getRate } = useWorldRates(selectedCountries);

  // Get unique currencies from selected countries
  const currencies = useMemo(() => {
    return Array.from(new Set(selectedCountries.map((c) => c.currency.code)));
  }, [selectedCountries]);

  const [baseCurrency, setBaseCurrency] = useState(currencies[0] || "USD");
  const [isDropDownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update base currency if it's not in the list anymore
  useEffect(() => {
    if (currencies.length > 0 && !currencies.includes(baseCurrency)) {
      setBaseCurrency(currencies[0]);
    }
  }, [currencies, baseCurrency]);

  const formatRate = (rate: number) => {
    if (rate === 0) return "0";
    if (rate >= 100) return formatCommas(rate);
    if (rate >= 1) return rate.toFixed(4);
    return rate.toFixed(6);
  };

  const getCountryByCode = (currencyCode: string) => {
    return selectedCountries.find((c) => c.currency.code === currencyCode);
  };

  if (selectedCountries.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <p className="text-center text-gray-500">
          No countries selected. Please add countries to view currency rates.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Rates</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Base Currency Selector */}
          <div className="flex gap-4 items-center">
            <div className="text-xl font-bold text-gray-800">BASE:</div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropDownOpen)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <ReactCountryFlag
                  countryCode={getCountryByCode(baseCurrency)?.code || "UN"}
                  svg
                  style={{ width: "1.5em", height: "1em" }}
                />
                <span className="uppercase">{baseCurrency}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isDropDownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropDownOpen && (
                <div className="absolute left-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  {currencies.map((code) => {
                    const country = getCountryByCode(code);

                    return (
                      <button
                        key={code}
                        onClick={() => {
                          setBaseCurrency(code);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-1 text-left hover:bg-blue-50 transition-colors ${
                          baseCurrency === code ? "bg-blue-100" : ""
                        }`}
                      >
                        <ReactCountryFlag
                          countryCode={country?.code || "UN"}
                          svg
                          style={{ width: "1.2em", height: "1em" }}
                        />
                        <span className="font-semibold uppercase text-gray-800 whitespace-nowrap">
                          {code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Rates List */}
      <div className="space-y-2">
        {currencies
          .filter((code) => code !== baseCurrency)
          .map((code) => {
            const country = getCountryByCode(code);
            if (!country) return null;

            const rate = getRate(baseCurrency, code);

            return (
              <div
                key={code}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ReactCountryFlag
                    countryCode={country.code}
                    svg
                    style={{ width: "3em", height: "2em" }}
                    title={country.name}
                  />
                  <span className="text-gray-600">
                    {country?.currency.name}
                  </span>
                </div>

                <div className="text-right">
                  <div className="flex gap-2 items-center">
                    <span className="text-xl font-bold text-gray-800">
                      {formatRate(rate)}
                    </span>
                    <span>
                      <RateIndicator value={rate} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
