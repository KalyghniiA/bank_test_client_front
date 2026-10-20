export type AuthReason = 'expired' | 'logout'

/** Адрес страницы входа: куда вернуть пользователя после входа и почему он здесь. */
export function buildAuthUrl(next?: string, reason?: AuthReason): string {
  const params = new URLSearchParams()
  if (next && next !== '/') params.set('next', next)
  if (reason) params.set('reason', reason)
  const query = params.toString()
  return query ? `/auth?${query}` : '/auth'
}

/**
 * Параметр next приходит из адресной строки — ему нельзя доверять.
 * Пускаем только внутренние пути ("/accounts/1"), иначе ссылка вида /auth?next=https://evil.example
 * уводила бы пользователя на чужой сайт после входа.
 */
export function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/'
  if (next === '/auth' || next.startsWith('/auth?')) return '/'
  return next
}

export function parseReason(value: string | null): AuthReason | null {
  return value === 'expired' || value === 'logout' ? value : null
}
