import { useState } from "react";
import { X, Search, Globe, Plus } from "lucide-react";
import { COUNTRIES } from "@/config/countries";
import type { CountryType } from "./index.type";

type AddCountryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (country: CountryType) => void;
  selectedCountries: CountryType[];
};

export const AddCountryModal = ({ isOpen, onClose, onAdd, selectedCountries }: AddCountryModalProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredCountries = COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedCountries.find((c) => c.timezone === country.timezone)
  );

  const handleAdd = (country: CountryType) => {
    onAdd(country);
    setSearchTerm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Add Country</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a country..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Country List */}
        <div className="overflow-y-auto flex-1 p-4">
          {filteredCountries.length === 0 ? (
            <div className="text-center py-12">
              <Globe size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No countries found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCountries.map((country) => (
                <button
                  key={country.timezone}
                  onClick={() => handleAdd(country)}
                  className="px-4 py-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Globe size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-800 font-medium block truncate">{country.name}</span>
                      <span className="text-xs text-gray-400">
                        UTC {country.offset >= 0 ? '+' : ''}{country.offset}
                      </span>
                    </div>
                  </div>
                  <Plus size={18} className="text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};