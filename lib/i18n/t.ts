import { DEFAULT_LANGUAGE, normalizeLanguage, type Language } from '@/lib/i18n'
import { messagesEn } from './messages.en'
import { messagesFr } from './messages.fr'

type Messages = typeof messagesEn

const MESSAGES_BY_LANGUAGE: Record<Language, Messages> = {
  en: messagesEn,
  fr: messagesFr,
}

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj)
}

export function t(language: Language | undefined, key: string, vars?: Record<string, string | number>): string {
  const lang = normalizeLanguage(language ?? DEFAULT_LANGUAGE)
  const base = MESSAGES_BY_LANGUAGE[lang]
  const fallback = MESSAGES_BY_LANGUAGE.en

  const template = getByPath(base, key) ?? getByPath(fallback, key) ?? null
  if (typeof template !== 'string') {
    // Fall back to English key name only if missing everywhere.
    return key
  }

  if (!vars) return template

  return template.replace(/\{(\w+)\}/g, (_match, name) => {
    const value = vars[name]
    return value === undefined || value === null ? '' : String(value)
  })
}
