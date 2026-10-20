import type { IconName } from '@bank/ui'

export interface NavItem {
  to: string
  label: string
  icon: IconName
}

/** Основные разделы интернет-банка: нижнее меню на телефоне и шапка на десктопе. */
export const navItems: NavItem[] = [
  { to: '/', label: 'Главная', icon: 'home' },
  { to: '/transfer', label: 'Переводы', icon: 'transfer' },
  { to: '/profile', label: 'Профиль', icon: 'user' },
]
