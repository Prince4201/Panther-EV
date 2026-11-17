// Configurable list. Currency / language / dealer data can hang off these codes later without changing the selector.
export interface Country { code: string; name: string; currency: string; dial: string }
export const countries: Country[] = [
  { code: 'IN', name: 'India', currency: 'INR', dial: '+91' },
  { code: 'DE', name: 'Germany', currency: 'EUR', dial: '+49' },
  { code: 'US', name: 'United States', currency: 'USD', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', dial: '+44' },
  { code: 'AE', name: 'UAE', currency: 'AED', dial: '+971' },
];
export const defaultCountry = countries[0];
