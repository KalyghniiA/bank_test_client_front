import { z } from 'zod'
import { parseRuDate, todayIso } from '../../utils/date'

// Правила — из таблицы «Клиент» в требованиях. Сервер проверяет их ещё раз.
const MAX_NAME = 100
const tooLong = `Не больше ${MAX_NAME} символов`

export const registerSchema = z.object({
  lastName: z.string().trim().min(1, 'Укажите фамилию').max(MAX_NAME, tooLong),
  firstName: z.string().trim().min(1, 'Укажите имя').max(MAX_NAME, tooLong),
  middleName: z.string().trim().max(MAX_NAME, tooLong),
  birthDate: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({ code: 'custom', message: 'Укажите дату рождения' })
        return
      }
      const iso = parseRuDate(value)
      if (!iso) {
        ctx.addIssue({ code: 'custom', message: 'Введите дату в формате ДД.ММ.ГГГГ' })
      } else if (iso >= todayIso()) {
        ctx.addIssue({ code: 'custom', message: 'Дата рождения должна быть в прошлом' })
      }
    }),
  phone: z
    .string()
    .trim()
    .max(12, 'Не больше 12 символов')
    .refine((value) => value === '' || /^\+?\d+$/.test(value), 'Только цифры и «+» в начале'),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'Введите email, например ivan@example.ru',
    ),
  login: z
    .string()
    .trim()
    .min(1, 'Придумайте логин')
    .min(3, 'Логин — от 3 до 100 символов')
    .max(100, 'Логин — от 3 до 100 символов'),
  password: z
    .string()
    .min(1, 'Придумайте пароль')
    .min(8, 'Пароль должен быть не короче 8 символов'),
})

export type RegisterValues = z.infer<typeof registerSchema>

export const emptyRegisterValues: RegisterValues = {
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  phone: '',
  email: '',
  login: '',
  password: '',
}

/** Путь поля в ответе сервера → поле формы. */
export const serverFieldToFormField: Record<string, keyof RegisterValues> = {
  'person.firstName': 'firstName',
  'person.subName': 'lastName',
  'person.surname': 'lastName',
  'person.middleName': 'middleName',
  'person.birthDate': 'birthDate',
  'person.number': 'phone',
  'person.phoneNumber': 'phone',
  'person.email': 'email',
  'credentials.login': 'login',
  'credentials.password': 'password',
}
