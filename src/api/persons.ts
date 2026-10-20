import { request } from './http'

export interface Registration {
  person: {
    firstName: string
    /** Фамилия. На бэкенде поле пока называется subName. */
    subName: string
    middleName: string | null
    /** ISO-дата: "1994-03-12". */
    birthDate: string
    /** Телефон. В запросе регистрации поле называется number (в ответе /api/me — phoneNumber). */
    number: string | null
    email: string | null
  }
  credentials: {
    login: string
    password: string
  }
}

/** POST /api/persons → 201 {id}; 400 — ошибки полей; 409 — логин занят. */
export function registerPerson(registration: Registration): Promise<{ id: string }> {
  return request<{ id: string }>('/api/persons', { method: 'POST', body: registration })
}
