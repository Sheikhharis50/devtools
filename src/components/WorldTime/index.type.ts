// @/components/WorldTime/index.type.ts

export type CurrencyType = {
  code: string;
  name: string;
};

export type CountryType = {
  name: string;
  timezone: string;
  offset: number;
  icon: string;
  code: string;
  currency: CurrencyType;
};
