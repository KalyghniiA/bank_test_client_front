import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import { ApiError } from './ApiError'
import { request } from './http'

const csrfNotFound = http.get('/api/auth/csrf', () => new HttpResponse(null, { status: 404 }))

async function catchError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('Ожидалась ошибка')
}

describe('request', () => {
  it('возвращает JSON при успехе', async () => {
    server.use(http.get('/api/me', () => HttpResponse.json({ firstName: 'Иван' })))
    await expect(request('/api/me')).resolves.toEqual({ firstName: 'Иван' })
  })

  it('возвращает undefined для 204', async () => {
    server.use(
      csrfNotFound,
      http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
    )
    await expect(request('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('понимает текущий формат ошибок бэкенда {message, errors}', async () => {
    server.use(
      csrfNotFound,
      http.post('/api/persons', () =>
        HttpResponse.json(
          {
            message: 'Ошибка валидации',
            errors: [{ field: 'person.firstName', message: 'не должно быть пустым' }],
          },
          { status: 400, headers: { 'X-Request-Id': 'req-1' } },
        ),
      ),
    )
    const error = await catchError(request('/api/persons', { method: 'POST', body: {} }))
    expect(error.status).toBe(400)
    expect(error.title).toBe('Ошибка валидации')
    expect(error.fieldErrors).toEqual([
      { field: 'person.firstName', message: 'не должно быть пустым' },
    ])
    expect(error.requestId).toBe('req-1')
  })

  it('понимает Problem Details', async () => {
    server.use(
      http.get('/api/accounts/1', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Не найдено',
            status: 404,
            detail: 'Счёт не найден',
            requestId: 'req-2',
          },
          { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )
    const error = await catchError(request('/api/accounts/1'))
    expect(error).toMatchObject({
      status: 404,
      title: 'Не найдено',
      detail: 'Счёт не найден',
      requestId: 'req-2',
    })
  })

  it('превращает обрыв сети в ошибку со статусом 0', async () => {
    server.use(http.get('/api/me', () => HttpResponse.error()))
    const error = await catchError(request('/api/me'))
    expect(error.isNetworkError).toBe(true)
  })

  it('отправляет CSRF-токен в изменяющих запросах, если сервер его выдал', async () => {
    let sentToken: string | null = null
    server.use(
      http.get('/api/auth/csrf', () =>
        HttpResponse.json({ headerName: 'X-CSRF-TOKEN', token: 'abc' }),
      ),
      http.post('/api/transfers', ({ request }) => {
        sentToken = request.headers.get('X-CSRF-TOKEN')
        return HttpResponse.json({ id: '1' }, { status: 201 })
      }),
    )
    const { resetCsrfToken } = await import('./http')
    resetCsrfToken()
    await request('/api/transfers', { method: 'POST', body: {}, idempotencyKey: 'key-1' })
    expect(sentToken).toBe('abc')
    resetCsrfToken()
  })
})
