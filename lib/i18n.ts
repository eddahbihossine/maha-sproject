export type Language = 'en' | 'fr'

export const DEFAULT_LANGUAGE: Language = 'en'

export function normalizeLanguage(value: unknown): Language {
  if (value === 'fr') return 'fr'
  return 'en'
}

export function localeForLanguage(language: Language): string {
  return language === 'fr' ? 'fr-MA' : 'en-GB'
}

export function formatMoneyMad(amount: number, language: Language): string {
  return amount.toLocaleString(localeForLanguage(language))
}

export function formatShortDate(
  dateInput: string | number | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  return date.toLocaleDateString(localeForLanguage(language), options)
}
