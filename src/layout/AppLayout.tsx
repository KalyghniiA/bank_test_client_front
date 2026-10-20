import { Button, Icon, Logo } from '@bank/ui'
import { Link, NavLink, Outlet } from 'react-router'
import { useLogout } from '../session/useLogout'
import { useMe } from '../session/useMe'
import { navItems } from './navigation'
import styles from './AppLayout.module.css'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [styles.navLink, isActive && styles.active].filter(Boolean).join(' ')

/** Каркас страниц вошедшего клиента: шапка на десктопе, нижнее меню на телефоне. */
export function AppLayout() {
  const me = useMe()
  const signOut = useLogout()
  const name = me.data ? `${me.data.firstName} ${me.data.lastName}`.trim() : ''

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" aria-label="Банк — на главную">
            <Logo />
          </Link>
          <nav aria-label="Основное меню" className={styles.headerNav}>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.user}>
            <span className={styles.userName}>{name}</span>
            <Button
              variant="ghost"
              size="m"
              icon="logout"
              loading={signOut.isPending}
              onClick={() => signOut.mutate()}
            >
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <Outlet />
      </div>

      <nav aria-label="Основное меню" className={styles.tabBar}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [styles.tab, isActive && styles.tabActive].filter(Boolean).join(' ')
            }
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
