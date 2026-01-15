// @/components/WorldTime/index.type.ts

export type CurrencyType = {
  code: string;
  name: string;
  symbol: string;
};

export type CountryType = {
  name: string;
  timezone: string;
  offset: number;
  icon: string;
  currency: CurrencyType;
};
