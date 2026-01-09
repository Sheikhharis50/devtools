import { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { CountryCard } from './CountryCard';
import { AddCountryModal } from './AddCountryModal';
import type { CountryType } from './index.type';
import { DEFAULT_COUNTRIES } from '@/config/constants';

const WorldTime = () => {
  const [selectedCountries, setSelectedCountries] = useState<CountryType[]>(DEFAULT_COUNTRIES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addCountry = (country: CountryType) => {
    setSelectedCountries([...selectedCountries, country]);
  };

  const removeCountry = (timezone: string) => {
    setSelectedCountries(selectedCountries.filter(c => c.timezone !== timezone));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        {/* Add Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Add Country
          </button>
        </div>

        {/* Country Cards - Responsive Grid */}
        {selectedCountries.length === 0 ? (
          <div className="text-center py-16">
            <Clock size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No countries added yet</h3>
            <p className="text-gray-500">Click the "Add Country" button to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {selectedCountries.map((country) => (
              <CountryCard
                key={country.timezone}
                country={country}
                onRemove={() => removeCountry(country.timezone)}
              />
            ))}
          </div>
        )}
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

export default WorldTime;