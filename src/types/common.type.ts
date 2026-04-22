export const CurrencyEnum = {
	RON: 'RON',
	EUR: 'EUR',
	USD: 'USD',
} as const;

export type Currency = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];

export const CURRENCY_DEFAULT = CurrencyEnum.RON;

export const LanguageEnum = {
	EN: 'en',
	RO: 'ro',
} as const;

export type Language = (typeof LanguageEnum)[keyof typeof LanguageEnum];

export const LANGUAGE_DEFAULT = LanguageEnum.EN;
