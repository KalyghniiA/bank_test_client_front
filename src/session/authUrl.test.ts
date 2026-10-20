import { describe, expect, it } from 'vitest'
import { buildAuthUrl, safeNext } from './authUrl'

describe('safeNext', () => {
  it('пропускает внутренние пути', () => {
    expect(safeNext('/accounts/1?tab=history')).toBe('/accounts/1?tab=history')
  })

  it('не даёт увести на чужой сайт', () => {
    expect(safeNext('https://evil.example')).toBe('/')
    expect(safeNext('//evil.example')).toBe('/')
    expect(safeNext('/\\evil.example')).toBe('/')
  })

  it('не зацикливает на /auth и подставляет главную по умолчанию', () => {
    expect(safeNext('/auth?next=/')).toBe('/')
    expect(safeNext(null)).toBe('/')
  })
})

describe('buildAuthUrl', () => {
  it('запоминает, куда вернуться, и причину', () => {
    expect(buildAuthUrl('/accounts/1', 'expired')).toBe('/auth?next=%2Faccounts%2F1&reason=expired')
    expect(buildAuthUrl('/')).toBe('/auth')
  })
})
