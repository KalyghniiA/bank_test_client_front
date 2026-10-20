import { describe, expect, it } from 'vitest'
import type { Account } from '../../api/accounts'
import {
  accountMeta,
  accountTitle,
  availableAmount,
  totalBalance,
  visibleAccounts,
} from './accountView'

const base: Account = {
  id: '1',
  number: '40817810000000002345',
  type: 'DEFAULT',
  status: 'ACTIVE',
  balance: '0.00',
  openedAt: '2026-02-02',
}

const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ')

describe('вычисления по счетам', () => {
  it('складывает балансы без ошибок плавающей точки', () => {
    const accounts = [
      { ...base, balance: '0.10' },
      { ...base, balance: '0.20' },
    ]
    expect(totalBalance(accounts)).toBe('0.30')
  })

  it('учитывает отрицательный баланс овердрафта в общей сумме', () => {
    const accounts = [
      { ...base, balance: '1000.00' },
      { ...base, type: 'CHECKING' as const, balance: '-3450.00', overdraftLimit: '10000.00' },
    ]
    expect(totalBalance(accounts)).toBe('-2450.00')
  })

  it('доступно для счёта с овердрафтом = баланс + лимит', () => {
    const checking: Account = {
      ...base,
      type: 'CHECKING',
      balance: '-3450.00',
      overdraftLimit: '10000.00',
    }
    expect(availableAmount(checking)).toBe('6550.00')
    const meta = accountMeta(checking)
    expect(plain(meta?.text ?? '')).toBe('Доступно 6 550,00 ₽')
    expect(meta?.tone).toBe('warning')
  })

  it('подписывает накопительный счёт остатком снятий', () => {
    const saving: Account = { ...base, type: 'SAVING', withdrawalsLeft: 3, withdrawalsLimit: 5 }
    expect(accountMeta(saving)?.text).toBe('Снятий осталось 3 из 5')
    expect(plain(accountTitle(saving))).toBe('Накопительный · •• 2345')
  })

  it('скрывает закрытые счета', () => {
    expect(visibleAccounts([base, { ...base, id: '2', status: 'CLOSED' }])).toHaveLength(1)
  })
})
