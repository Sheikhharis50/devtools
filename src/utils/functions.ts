import moment from "moment";

export const formatWithCommas = (value?: number) => {
  if (value === undefined || !Number.isFinite(value)) return "—";

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

export function setWithExpiry<T>(key: string, data: T) {
  const item = {
    data,
    expiresAt: moment().add(24, "hours").toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);

    if (!item.expiresAt || moment().isAfter(moment(item.expiresAt))) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}
