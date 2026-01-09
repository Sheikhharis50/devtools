import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { formatTime, getTimeForTimezone } from "@/utils/time";
import type { CountryType } from "./index.type";

type CountryCardProps = {
  country: CountryType;
  onRemove: () => void;
};

export const CountryCard = ({ country, onRemove }: CountryCardProps) => {
  const [currentTime, setCurrentTime] = useState(getTimeForTimezone(country.offset));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getTimeForTimezone(country.offset));
    }, 1000);

    return () => clearInterval(interval);
  }, [country.offset]);

  const timeString = formatTime(currentTime.hours, currentTime.minutes, currentTime.seconds);

  return (
    <div className="bg-white rounded-xl shadow-md px-4 py-5 hover:shadow-lg transition-all relative">
      {/* Close Button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
        aria-label="Remove country"
      >
        <X size={18} />
      </button>

      {/* Content */}
      <div className="flex flex-col items-center text-center">
        {/* Icon and Name */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            {country.icon}
            ({country.offset})
          </div>
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{country.name}</h3>
        </div>

        {/* Time */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">{timeString}</span>
          </div>
        </div>
      </div>
    </div>
  );
};