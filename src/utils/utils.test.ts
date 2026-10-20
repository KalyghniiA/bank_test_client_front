import { describe, expect, it } from 'vitest'
import { maskRuDate, parseRuDate, todayIso } from './date'
import { plural } from './plural'

describe('дата рождения', () => {
  it('маска расставляет точки и отбрасывает лишнее', () => {
    expect(maskRuDate('12')).toBe('12')
    expect(maskRuDate('1203')).toBe('12.03')
    expect(maskRuDate('12031994')).toBe('12.03.1994')
    expect(maskRuDate('12.03.1994999')).toBe('12.03.1994')
    expect(maskRuDate('1a2b')).toBe('12')
  })

  it('переводит в ISO только существующие даты', () => {
    expect(parseRuDate('12.03.1994')).toBe('1994-03-12')
    expect(parseRuDate('29.02.2024')).toBe('2024-02-29')
    expect(parseRuDate('29.02.2023')).toBeNull()
    expect(parseRuDate('31.04.2000')).toBeNull()
    expect(parseRuDate('12.03.94')).toBeNull()
  })

  it('сегодняшняя дата по местному времени', () => {
    expect(todayIso(new Date(2026, 9, 20, 23, 59))).toBe('2026-10-20')
  })
})

describe('plural', () => {
  it.each([
    [1, 'поле'],
    [2, 'поля'],
    [4, 'поля'],
    [5, 'полей'],
    [11, 'полей'],
    [12, 'полей'],
    [21, 'поле'],
    [22, 'поля'],
  ])('%i → %s', (count, expected) => {
    expect(plural(count, 'поле', 'поля', 'полей')).toBe(expected)
  })
})
