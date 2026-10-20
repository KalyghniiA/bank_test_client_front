import { ApiError, type FieldError } from './ApiError'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: Method
  /** Тело запроса — отправляется как JSON. */
  body?: unknown
  /** Ключ идемпотентности денежной операции: один ключ на одну операцию, повтор не спишет деньги дважды. */
  idempotencyKey?: string
  signal?: AbortSignal
}

/**
 * Запрос к API. Cookie сессии (JSESSIONID, HttpOnly) браузер отправляет сам — фронтенд её не читает и не хранит.
 * Успешный ответ возвращается как JSON (или undefined для 204), ошибка — исключением ApiError.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, idempotencyKey, signal } = options
  const headers = new Headers({ Accept: 'application/json' })

  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey)
  if (method !== 'GET') {
    const csrf = await getCsrfToken()
    if (csrf) headers.set(csrf.headerName, csrf.token)
  }

  let response: Response
  try {
    // Абсолютный URL от текущего адреса: в браузере это тот же origin, в тестах (jsdom) — его location.
    response = await fetch(new URL(path, window.location.href), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError({ status: 0, title: 'Нет соединения с сервером' })
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

// ---------- CSRF ----------

interface CsrfToken {
  headerName: string
  token: string
}

let csrfToken: Promise<CsrfToken | null> | null = null

/**
 * Токен берётся из GET /api/auth/csrf один раз и кэшируется.
 * Пока эндпоинта на бэкенде нет, получаем null — и запросы уходят без заголовка.
 */
function getCsrfToken(): Promise<CsrfToken | null> {
  csrfToken ??= fetch(new URL('/api/auth/csrf', window.location.href), { credentials: 'include' })
    .then(async (response) => (response.ok ? parseCsrf(await response.json()) : null))
    .catch(() => null)
  return csrfToken
}

function parseCsrf(body: unknown): CsrfToken | null {
  if (!isRecord(body) || typeof body.headerName !== 'string' || typeof body.token !== 'string') {
    return null
  }
  return { headerName: body.headerName, token: body.token }
}

/** Сбросить кэш токена: после входа и выхода сессия новая, и токен у неё новый. */
export function resetCsrfToken(): void {
  csrfToken = null
}

// ---------- Разбор ошибок ----------

async function toApiError(response: Response): Promise<ApiError> {
  const headerRequestId = response.headers.get('X-Request-Id') ?? undefined
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // Тело не JSON (например, страница ошибки Tomcat) — обойдёмся статусом.
  }

  if (!isRecord(body)) {
    return new ApiError({
      status: response.status,
      title: defaultTitle(response.status),
      requestId: headerRequestId,
    })
  }

  // Problem Details: {title, detail, status, errors, requestId}. Текущий формат бэкенда: {message, errors}.
  return new ApiError({
    status: response.status,
    title: asString(body.title) ?? asString(body.message) ?? defaultTitle(response.status),
    detail: asString(body.detail),
    fieldErrors: Array.isArray(body.errors) ? body.errors.filter(isFieldError) : [],
    requestId: asString(body.requestId) ?? headerRequestId,
  })
}

function defaultTitle(status: number): string {
  if (status === 401) return 'Требуется вход'
  if (status === 403) return 'Нет доступа'
  if (status === 404) return 'Не найдено'
  if (status >= 500) return 'Сервер временно недоступен'
  return 'Не удалось выполнить запрос'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function isFieldError(value: unknown): value is FieldError {
  return isRecord(value) && typeof value.field === 'string' && typeof value.message === 'string'
}
