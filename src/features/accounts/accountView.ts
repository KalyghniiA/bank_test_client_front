import { formatMoney, maskAccountNumber, type AccountKind, type MoneyString } from '@bank/ui'
import Decimal from 'decimal.js-light'
import type { Account, AccountType } from '../../api/accounts'

// Отображение счёта в интерфейсе: названия, подписи, вычисления. Деньги считаем только в Decimal.

const kinds: Record<AccountType, AccountKind> = {
  DEFAULT: 'default',
  SAVING: 'saving',
  CHECKING: 'checking',
}

/** Полные названия типов — для заголовков и выбора типа. */
export const accountTypeNames: Record<AccountType, string> = {
  DEFAULT: 'Дебетовый счёт',
  SAVING: 'Накопительный счёт',
  CHECKING: 'Счёт с овердрафтом',
}

/** Короткие названия — для списков. */
const shortTypeNames: Record<AccountType, string> = {
  DEFAULT: 'Дебетовый',
  SAVING: 'Накопительный',
  CHECKING: 'С овердрафтом',
}

export function accountKind(account: Account): AccountKind {
  return kinds[account.type]
}

/** «Накопительный · •• 7781» */
export function accountTitle(account: Account): string {
  return `${shortTypeNames[account.type]} · ${maskAccountNumber(account.number)}`
}

/** Сколько можно потратить: для счёта с овердрафтом — баланс + лимит, для остальных — баланс. */
export function availableAmount(account: Account): MoneyString {
  if (account.type !== 'CHECKING') return account.balance
  return new Decimal(account.balance).plus(account.overdraftLimit ?? '0').toFixed(2)
}

export interface AccountMeta {
  text: string
  tone: 'default' | 'warning'
}

/** Особенность типа для строки в списке. */
export function accountMeta(account: Account): AccountMeta | null {
  if (
    account.type === 'SAVING' &&
    account.withdrawalsLeft !== undefined &&
    account.withdrawalsLimit !== undefined
  ) {
    return {
      text: `Снятий осталось ${account.withdrawalsLeft} из ${account.withdrawalsLimit}`,
      tone: 'default',
    }
  }
  if (account.type === 'CHECKING') {
    const negative = new Decimal(account.balance).isNegative()
    return {
      text: `Доступно ${formatMoney(availableAmount(account))}`,
      tone: negative ? 'warning' : 'default',
    }
  }
  return null
}

/** Счета для главной: закрытые не показываем. */
export function visibleAccounts(accounts: Account[]): Account[] {
  return accounts.filter((account) => account.status !== 'CLOSED')
}

/** Общая сумма на счетах (с учётом отрицательного баланса овердрафта). */
export function totalBalance(accounts: Account[]): MoneyString {
  return accounts.reduce((sum, account) => sum.plus(account.balance), new Decimal(0)).toFixed(2)
}
