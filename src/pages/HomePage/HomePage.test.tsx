import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Account } from '../../api/accounts'
import { mockAccounts } from '../../mocks/data/accounts'
import { renderApp } from '../../test/renderApp'
import { server } from '../../test/server'

const person = { firstName: 'Иван', subName: 'Петров', birthDate: '1994-03-12' }
const plain = (s: string | null) => (s ?? '').replace(/[\u00a0\u202f]/g, ' ')

function withAccounts(accounts: Account[]) {
  server.use(http.get('/api/me/accounts', () => HttpResponse.json(accounts)))
}

describe('главная', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/me', () => HttpResponse.json(person)),
      http.get('/api/auth/csrf', () => new HttpResponse(null, { status: 404 })),
    )
  })

  it('показывает общую сумму и счета со ссылками на карточки', async () => {
    withAccounts(mockAccounts)
    renderApp('/')

    await screen.findByText('Всего на счетах')
    const list = screen.getByRole('list')
    const links = within(list).getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute('href', `/accounts/${mockAccounts[0]?.id}`)

    // 150 000,00 + 48 210,50 + 2 300,00
    expect(plain(screen.getByText('Всего на счетах').nextElementSibling?.textContent ?? null)).toBe(
      '200 510,50 ₽',
    )
    expect(within(list).getByText('Снятий осталось 3 из 5')).toBeInTheDocument()
    expect(plain(within(list).getByText(/^Доступно/).textContent)).toBe('Доступно 12 300,00 ₽')
  })

  it('не показывает закрытые счета и не учитывает их в сумме', async () => {
    const [saving, debit] = mockAccounts as [Account, Account]
    withAccounts([saving, { ...debit, status: 'CLOSED' }])
    renderApp('/')

    await screen.findByText('Всего на счетах')
    const list = screen.getByRole('list')
    expect(within(list).getAllByRole('link')).toHaveLength(1)
    expect(plain(screen.getByText('Всего на счетах').nextElementSibling?.textContent ?? null)).toBe(
      '150 000,00 ₽',
    )
  })

  it('помечает заблокированный счёт', async () => {
    const [saving] = mockAccounts as [Account]
    withAccounts([{ ...saving, status: 'BLOCKED' }])
    renderApp('/')
    expect(await screen.findByText('Заблокирован')).toBeInTheDocument()
  })

  it('без счетов предлагает открыть первый', async () => {
    withAccounts([])
    renderApp('/')
    expect(
      await screen.findByRole('heading', { name: 'У вас пока нет счетов' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Всего на счетах')).not.toBeInTheDocument()
    const openLinks = screen.getAllByRole('link', { name: 'Открыть счёт' })
    expect(openLinks[0]).toHaveAttribute('href', '/accounts/new')
  })

  it('при ошибке показывает код для поддержки и даёт повторить', async () => {
    let calls = 0
    server.use(
      http.get('/api/me/accounts', () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json(
              { title: 'Внутренняя ошибка', status: 500, requestId: 'req-42' },
              { status: 500 },
            )
          : HttpResponse.json(mockAccounts)
      }),
    )
    renderApp('/')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Не удалось загрузить счета')
    expect(alert).toHaveTextContent('Код для поддержки: req-42')

    await userEvent.setup().click(screen.getByRole('button', { name: 'Повторить' }))
    expect(await screen.findByText('Всего на счетах')).toBeInTheDocument()
  })

  it('выходит из аккаунта по кнопке в шапке', async () => {
    withAccounts(mockAccounts)
    // Как на сервере: после выхода сессии нет и /api/me отвечает 401.
    let loggedOut = false
    server.use(
      http.post('/api/auth/logout', () => {
        loggedOut = true
        return new HttpResponse(null, { status: 204 })
      }),
      http.get('/api/me', () =>
        loggedOut
          ? HttpResponse.json({ message: 'Требуется аутентификация' }, { status: 401 })
          : HttpResponse.json(person),
      ),
    )
    const { router } = renderApp('/')

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Выйти' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/auth'))
    expect(router.state.location.search).toBe('?reason=logout')
  })
})
