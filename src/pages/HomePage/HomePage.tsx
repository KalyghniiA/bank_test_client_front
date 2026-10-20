import { AccountCard, Alert, Button, Icon, QuickAction, Skeleton, formatMoney } from '@bank/ui'
import { Link } from 'react-router'
import type { Account } from '../../api/accounts'
import { isApiError } from '../../api/ApiError'
import {
  accountKind,
  accountMeta,
  accountTitle,
  totalBalance,
  visibleAccounts,
} from '../../features/accounts/accountView'
import { useMyAccounts } from '../../features/accounts/useMyAccounts'
import { useMe } from '../../session/useMe'
import styles from './HomePage.module.css'

export function HomePage() {
  const me = useMe()
  const accountsQuery = useMyAccounts()
  const accounts = accountsQuery.data ? visibleAccounts(accountsQuery.data) : []
  const isEmpty = accountsQuery.isSuccess && accounts.length === 0
  const firstName = me.data?.firstName ?? ''
  const initials = `${me.data?.lastName.charAt(0) ?? ''}${firstName.charAt(0)}`

  return (
    <main className={styles.page}>
      <h1 className="visually-hidden">Главная</h1>

      {/* Телефон: кто вошёл, переход в профиль. На десктопе имя в шапке. */}
      <Link to="/profile" className={styles.profile}>
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <span className={styles.profileName}>{firstName}</span>
        <Icon name="chevron-right" size={20} className={styles.profileChevron} />
      </Link>

      <section className={styles.hero} aria-label="Сводка по счетам">
        <div className={styles.total}>
          {accountsQuery.isPending && (
            <>
              <Skeleton width={140} height={16} />
              <Skeleton width={260} height={40} radius={10} />
            </>
          )}
          {accountsQuery.isSuccess && !isEmpty && (
            <>
              <p className={styles.totalLabel}>Всего на счетах</p>
              <p className={styles.totalAmount}>{formatMoney(totalBalance(accounts))}</p>
            </>
          )}
          {isEmpty && (
            <>
              <p className={styles.greeting}>Здравствуйте, {firstName}</p>
              <p className={styles.totalLabel}>
                Откройте первый счёт, чтобы пополнять, снимать и переводить деньги
              </p>
            </>
          )}
        </div>

        {!isEmpty && (
          <>
            <div className={styles.quickActions}>
              <QuickAction as={Link} to="/deposit" icon="deposit" label="Пополнить" />
              <QuickAction as={Link} to="/transfer" icon="transfer" label="Перевести" />
              <QuickAction as={Link} to="/withdraw" icon="withdraw" label="Снять" />
              <QuickAction as={Link} to="/accounts/new" icon="plus" label="Открыть счёт" />
            </div>
            <div className={styles.heroActions}>
              <Button as={Link} to="/deposit" variant="secondary">
                Пополнить
              </Button>
              <Button as={Link} to="/withdraw" variant="secondary">
                Снять
              </Button>
              <Button as={Link} to="/transfer">
                Перевести
              </Button>
            </div>
          </>
        )}
        {isEmpty && (
          <Button as={Link} to="/accounts/new" className={styles.heroActions}>
            Открыть счёт
          </Button>
        )}
      </section>

      {isEmpty ? (
        <EmptyAccounts />
      ) : (
        <section
          className={styles.accounts}
          aria-labelledby="accounts-title"
          aria-busy={accountsQuery.isPending}
        >
          <div className={styles.accountsHead}>
            <h2 id="accounts-title" className={styles.accountsTitle}>
              Счета
            </h2>
            <Link to="/accounts/new" className={styles.openLink}>
              <Icon name="plus" size={20} />
              Открыть счёт
            </Link>
          </div>

          {accountsQuery.isPending && <AccountsSkeleton />}
          {accountsQuery.isError && (
            <div className={styles.error}>
              <Alert
                variant="error"
                icon="wifi-off"
                title="Не удалось загрузить счета"
                supportCode={
                  isApiError(accountsQuery.error) ? accountsQuery.error.requestId : undefined
                }
              >
                Проверьте соединение и попробуйте ещё раз
              </Alert>
              <Button
                variant="secondary"
                size="m"
                loading={accountsQuery.isFetching}
                onClick={() => void accountsQuery.refetch()}
              >
                Повторить
              </Button>
            </div>
          )}
          {accountsQuery.isSuccess && (
            <ul className={styles.list}>
              {accounts.map((account) => (
                <li key={account.id}>
                  <AccountItem account={account} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}

function AccountItem({ account }: { account: Account }) {
  const meta = accountMeta(account)
  return (
    <AccountCard
      as={Link}
      to={`/accounts/${account.id}`}
      kind={accountKind(account)}
      balance={account.balance}
      title={accountTitle(account)}
      meta={meta?.text}
      metaTone={meta?.tone}
      blocked={account.status === 'BLOCKED'}
    />
  )
}

function AccountsSkeleton() {
  return (
    <ul className={styles.list}>
      {[1, 2, 3].map((key) => (
        <li key={key} className={styles.skeletonCard}>
          <Skeleton width={44} height={44} radius={12} />
          <span className={styles.skeletonLines}>
            <Skeleton width={120} height={18} />
            <Skeleton width={170} height={12} />
          </span>
        </li>
      ))}
    </ul>
  )
}

const accountTypes = [
  {
    kind: 'default',
    icon: 'wallet',
    title: 'Дебетовый',
    text: 'Для повседневных трат. Баланс не уходит в минус.',
  },
  {
    kind: 'saving',
    icon: 'percent',
    title: 'Накопительный',
    text: 'Проценты на остаток раз в 30 дней. Число снятий за период ограничено.',
  },
  {
    kind: 'checking',
    icon: 'card',
    title: 'С овердрафтом',
    text: 'Можно уйти в минус до лимита овердрафта.',
  },
] as const

function EmptyAccounts() {
  return (
    <section className={styles.empty} aria-labelledby="empty-title">
      {/* Телефон: карточка с призывом открыть счёт. */}
      <div className={styles.emptyCard}>
        <span className={styles.emptyIcon}>
          <Icon name="wallet" size={36} />
        </span>
        <h2 id="empty-title" className={styles.emptyTitle}>
          У вас пока нет счетов
        </h2>
        <p className={styles.emptyText}>
          Откройте первый счёт, чтобы пополнять, снимать и переводить деньги
        </p>
        <Button as={Link} to="/accounts/new" fullWidth>
          Открыть счёт
        </Button>
      </div>

      {/* Десктоп: чем отличаются типы счетов. */}
      <div className={styles.types}>
        <h2 className={styles.accountsTitle}>Какой счёт подойдёт</h2>
        <ul className={styles.typesList}>
          {accountTypes.map((type) => (
            <li key={type.kind} className={styles.typeCard}>
              <span className={`${styles.typeIcon} ${styles[type.kind]}`}>
                <Icon name={type.icon} size={22} />
              </span>
              <p className={styles.typeTitle}>{type.title}</p>
              <p className={styles.typeText}>{type.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
