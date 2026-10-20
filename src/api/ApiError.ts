export interface FieldError {
  /** Путь поля, как его вернул сервер: "login", "person.firstName". */
  field: string
  message: string
}

export interface ApiErrorInit {
  status: number
  title: string
  detail?: string
  fieldErrors?: FieldError[]
  requestId?: string
}

/**
 * Единый вид ошибки для всего приложения — независимо от формата ответа сервера
 * (сейчас {message, errors}, после перехода на Spring — Problem Details).
 */
export class ApiError extends Error {
  /** HTTP-статус; 0 — запрос не дошёл до сервера (нет сети, сервер выключен). */
  readonly status: number
  readonly title: string
  readonly detail?: string
  readonly fieldErrors: FieldError[]
  /** Идентификатор запроса для поддержки (из тела ответа или заголовка X-Request-Id). */
  readonly requestId?: string

  constructor({ status, title, detail, fieldErrors = [], requestId }: ApiErrorInit) {
    super(title)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = detail
    this.fieldErrors = fieldErrors
    this.requestId = requestId
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isServerError(): boolean {
    return this.status >= 500
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
