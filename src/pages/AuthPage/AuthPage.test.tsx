import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp } from '../../test/renderApp'
import { server } from '../../test/server'

const person = {
  firstName: 'Иван',
  subName: 'Петров',
  middleName: 'Сергеевич',
  birthDate: '1994-03-12',
  phoneNumber: '+79001234567',
  email: 'ivan@example.ru',
}

describe('страница входа', () => {
  beforeEach(() => {
    // По умолчанию: сессии нет, CSRF-эндпоинта нет (как сейчас на бэкенде).
    server.use(
      http.get('/api/me', () =>
        HttpResponse.json({ message: 'Требуется аутентификация' }, { status: 401 }),
      ),
      http.get('/api/auth/csrf', () => new HttpResponse(null, { status: 404 })),
    )
  })

  async function fillAndSubmit(login: string, password: string) {
    const user = userEvent.setup()
    if (login) await user.type(screen.getByLabelText('Логин'), login)
    if (password) await user.type(screen.getByLabelText('Пароль'), password)
    await user.click(screen.getByRole('button', { name: 'Войти' }))
  }

  it('показывает ошибки у пустых полей и не отправляет запрос', async () => {
    renderApp('/auth')
    await fillAndSubmit('', '')
    expect(await screen.findByText('Введите логин')).toBeInTheDocument()
    expect(screen.getByText('Введите пароль')).toBeInTheDocument()
    expect(screen.getByLabelText('Логин')).toHaveAttribute('aria-invalid', 'true')
  })

  it('после входа ведёт туда, куда шёл клиент', async () => {
    // Как на сервере: после входа появляется сессия и /api/me начинает отвечать 200.
    let sentBody: unknown
    let loggedIn = false
    server.use(
      http.post('/api/auth/login', async ({ request }) => {
        sentBody = await request.json()
        loggedIn = true
        return HttpResponse.json(person)
      }),
      http.get('/api/me', () =>
        loggedIn
          ? HttpResponse.json(person)
          : HttpResponse.json({ message: 'Требуется аутентификация' }, { status: 401 }),
      ),
      http.get('/api/me/accounts', () => HttpResponse.json([])),
    )
    const { router } = renderApp('/auth?next=%2F')
    await fillAndSubmit('  ivan.petrov ', 'secret123')

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(await screen.findByRole('heading', { name: 'Главная' })).toBeInTheDocument()
    expect(sentBody).toEqual({ login: 'ivan.petrov', password: 'secret123' })
  })

  it('при 401 пишет одно сообщение «Неверный логин или пароль»', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({ message: 'Логин или пароль не верен' }, { status: 401 }),
      ),
    )
    renderApp('/auth')
    await fillAndSubmit('ivan.petrov', 'wrong-pass')
    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный логин или пароль')
  })

  it('при ошибке сервера показывает код для поддержки', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json(
          { message: 'Ошибка авторизации, попробуйте позже' },
          { status: 500, headers: { 'X-Request-Id': 'b1946ac9' } },
        ),
      ),
    )
    renderApp('/auth')
    await fillAndSubmit('ivan.petrov', 'secret123')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Не удалось войти')
    expect(alert).toHaveTextContent('Код для поддержки: b1946ac9')
  })

  it('сообщает, что сессия истекла', async () => {
    renderApp('/auth?reason=expired&next=%2Faccounts%2F1')
    expect(await screen.findByText('Сессия истекла, войдите снова')).toBeInTheDocument()
  })

  it('без сессии отправляет с защищённой страницы на вход', async () => {
    const { router } = renderApp('/')
    await waitFor(() => expect(router.state.location.pathname).toBe('/auth'))
    expect(await screen.findByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })
})
