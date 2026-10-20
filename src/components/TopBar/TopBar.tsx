import { Icon } from '@bank/ui'
import { Link } from 'react-router'
import styles from './TopBar.module.css'

export interface TopBarProps {
  title: string
  /** Куда ведёт стрелка «назад». */
  backTo: string
  className?: string
}

/** Шапка вложенного экрана на телефоне: «назад» и название экрана. */
export function TopBar({ title, backTo, className }: TopBarProps) {
  return (
    <div className={[styles.bar, className].filter(Boolean).join(' ')}>
      <Link to={backTo} className={styles.back} aria-label="Назад">
        <Icon name="chevron-left" />
      </Link>
      <p className={styles.title}>{title}</p>
    </div>
  )
}
