import { ArrowUp, ArrowDown } from "lucide-react";

interface RateIndicatorProps {
  value: number;
  showValue?: boolean;
  precision?: number;
}

export const RateIndicator = ({
  value,
  showValue = false,
  precision = 4,
}: RateIndicatorProps) => {
  if (!Number.isFinite(value)) return null;

  if (value > 1) {
    return (
      <div className="flex items-center gap-1 text-red-600 animate-bounce">
        <ArrowDown size={14} />
        {showValue && (
          <span className="font-semibold">{value.toFixed(precision)}</span>
        )}
      </div>
    );
  }

  if (value < 1) {
    return (
      <div className="flex items-center gap-1 text-green-600 animate-bounce">
        <ArrowUp size={14} />
        {showValue && (
          <span className="font-semibold">{value.toFixed(precision)}</span>
        )}
      </div>
    );
  }

  // value === 1
  return (
    <div className="flex items-center gap-1 text-gray-400">
      <span className="text-sm font-medium">—</span>
      {showValue && <span>1.0000</span>}
    </div>
  );
};
