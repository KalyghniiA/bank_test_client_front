import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp } from '../../test/renderApp'
import { server } from '../../test/server'

const valid = {
  Фамилия: 'Петров',
  Имя: 'Иван',
  'Дата рождения': '12031994',
  Логин: 'ivan.petrov',
  Пароль: 'secret123',
}

async function fill(fields: Record<string, string>) {
  const user = userEvent.setup()
  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(label)
    await user.clear(input)
    if (value) await user.type(input, value)
  }
  return user
}

async function submit(user = userEvent.setup()) {
  await user.click(screen.getByRole('button', { name: 'Создать аккаунт' }))
}

describe('страница регистрации', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/me', () =>
        HttpResponse.json({ message: 'Требуется аутентификация' }, { status: 401 }),
      ),
      http.get('/api/auth/csrf', () => new HttpResponse(null, { status: 404 })),
    )
  })

  it('отправляет данные в формате бэкенда', async () => {
    let sent: unknown
    server.use(
      http.post('/api/persons', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ id: 'b1946ac9' }, { status: 201 })
      }),
    )
    renderApp('/register')
    await submit(await fill({ ...valid, 'Телефон (необязательно)': '+79001234567' }))

    expect(await screen.findByRole('heading', { name: 'Аккаунт создан' })).toBeInTheDocument()
    expect(sent).toEqual({
      person: {
        firstName: 'Иван',
        subName: 'Петров',
        middleName: null,
        birthDate: '1994-03-12',
        number: '+79001234567',
        email: null,
      },
      credentials: { login: 'ivan.petrov', password: 'secret123' },
    })
  })

  it('маска даты расставляет точки при вводе', async () => {
    renderApp('/register')
    await fill({ 'Дата рождения': '12031994' })
    expect(screen.getByLabelText('Дата рождения')).toHaveValue('12.03.1994')
  })

  it('проверяет поля до отправки и показывает сводку', async () => {
    renderApp('/register')
    await submit(
      await fill({
        ...valid,
        Имя: '',
        'Дата рождения': '12032999',
        'Email (необязательно)': 'ivan@',
        Пароль: 'short',
      }),
    )

    expect(await screen.findByText('Проверьте 4 поля')).toBeInTheDocument()
    expect(screen.getByText('Укажите имя')).toBeInTheDocument()
    expect(screen.getByText('Дата рождения должна быть в прошлом')).toBeInTheDocument()
    expect(screen.getByText('Введите email, например ivan@example.ru')).toBeInTheDocument()
    expect(screen.getByText('Пароль должен быть не короче 8 символов')).toBeInTheDocument()
    expect(screen.getByLabelText('Имя')).toHaveAttribute('aria-invalid', 'true')
  })

  it('показывает ошибки сервера у соответствующих полей', async () => {
    server.use(
      http.post('/api/persons', () =>
        HttpResponse.json(
          {
            message: 'Некорректные данные',
            errors: [
              { field: 'person.email', message: 'должно иметь формат адреса электронной почты' },
            ],
          },
          { status: 400 },
        ),
      ),
    )
    renderApp('/register')
    await submit(await fill({ ...valid, 'Email (необязательно)': 'ivan@example.ru' }))

    expect(
      await screen.findByText('должно иметь формат адреса электронной почты'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email (необязательно)')).toHaveAttribute('aria-invalid', 'true')
  })

  it('сообщает, что логин занят', async () => {
    server.use(
      http.post('/api/persons', () =>
        HttpResponse.json({ message: 'Логин уже используется' }, { status: 409 }),
      ),
    )
    renderApp('/register')
    await submit(await fill(valid))

    expect(await screen.findByText('Логин уже занят — выберите другой')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText('Логин')).toHaveFocus())
  })

  it('после регистрации ведёт на вход с подставленным логином', async () => {
    server.use(http.post('/api/persons', () => HttpResponse.json({ id: '1' }, { status: 201 })))
    const { router } = renderApp('/register')
    const user = await fill(valid)
    await submit(user)

    await user.click(await screen.findByRole('button', { name: 'Войти' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/auth'))
    expect(screen.getByLabelText('Логин')).toHaveValue('ivan.petrov')
  })

  it('при ошибке сервера показывает код для поддержки', async () => {
    server.use(
      http.post('/api/persons', () =>
        HttpResponse.json(
          { message: 'Ошибка сохранения, попробуйте позже' },
          { status: 500, headers: { 'X-Request-Id': 'req-500' } },
        ),
      ),
    )
    renderApp('/register')
    await submit(await fill(valid))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Не удалось создать аккаунт')
    expect(alert).toHaveTextContent('Код для поддержки: req-500')
  })
})
