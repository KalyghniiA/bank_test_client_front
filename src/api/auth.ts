import { request, resetCsrfToken } from './http'

/** Клиент в том виде, как его отдаёт сервер. */
interface PersonDto {
  firstName: string
  /** Фамилия. Сейчас поле называется subName, планируется переименование в surname. */
  subName?: string
  surname?: string
  middleName?: string | null
  /** ISO-дата: "1994-03-12". */
  birthDate: string
  phoneNumber?: string | null
  email?: string | null
}

/** Клиент в том виде, как его использует интерфейс. */
export interface Person {
  firstName: string
  lastName: string
  middleName: string | null
  birthDate: string
  phone: string | null
  email: string | null
}

export interface Credentials {
  login: string
  password: string
}

function toPerson(dto: PersonDto): Person {
  return {
    firstName: dto.firstName,
    lastName: dto.surname ?? dto.subName ?? '',
    middleName: dto.middleName || null,
    birthDate: dto.birthDate,
    phone: dto.phoneNumber || null,
    email: dto.email || null,
  }
}

/** POST /api/auth/login → 200 с данными клиента или 401 («Неверный логин или пароль»). */
export async function login(credentials: Credentials): Promise<Person> {
  const dto = await request<PersonDto>('/api/auth/login', { method: 'POST', body: credentials })
  resetCsrfToken()
  return toPerson(dto)
}

/** POST /api/auth/logout → 204. */
export async function logout(): Promise<void> {
  await request<void>('/api/auth/logout', { method: 'POST' })
  resetCsrfToken()
}

/** GET /api/me → 200 или 401, если сессии нет. */
export async function getMe(): Promise<Person> {
  return toPerson(await request<PersonDto>('/api/me'))
}
