/** Маска ввода даты: оставляет до 8 цифр и расставляет точки — "12031994" → "12.03.1994". */
export function maskRuDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

/** "12.03.1994" → "1994-03-12". Несуществующая дата (31.02.2000) или неполный ввод → null. */
export function parseRuDate(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const day = Number(dd)
  const month = Number(mm)
  const year = Number(yyyy)
  const date = new Date(Date.UTC(year, month - 1, day))
  // Date «чинит» несуществующие даты (31.02 → 03.03) — сверяем, что ничего не сдвинулось.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return `${yyyy}-${mm}-${dd}`
}

/** Сегодняшняя дата по местному времени в ISO: "2026-10-20". */
export function todayIso(now: Date = new Date()): string {
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
