import type { MoneyString } from '@bank/ui'
import { request } from './http'

export type AccountType = 'DEFAULT' | 'SAVING' | 'CHECKING'
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'CLOSED'

/**
 * Счёт. Эндпоинта на бэкенде ещё нет — формат проектный
 * (требования-к-беку.md, раздел 3), сейчас его отдают моки MSW.
 */
export interface Account {
  id: string
  /** 20 цифр без пробелов. */
  number: string
  type: AccountType
  status: AccountStatus
  balance: MoneyString
  /** ISO-дата открытия. */
  openedAt: string
  /** SAVING: сколько снятий осталось в текущем периоде и сколько всего. */
  withdrawalsLeft?: number
  withdrawalsLimit?: number
  /** SAVING: дата следующего начисления процентов. */
  nextInterestAt?: string
  /** CHECKING: лимит овердрафта. */
  overdraftLimit?: MoneyString
}

/** GET /api/me/accounts → счета вошедшего клиента. */
export function getMyAccounts(): Promise<Account[]> {
  return request<Account[]>('/api/me/accounts')
}
