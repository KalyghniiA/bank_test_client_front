import { Button, formatMoney } from '@bank/ui'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

// Дымовой тест: библиотека подключается и в тестовом окружении.
describe('@bank/ui', () => {
  it('рендерит кнопку из библиотеки', () => {
    render(<Button>Войти</Button>)
    expect(screen.getByRole('button', { name: 'Войти' })).toBeEnabled()
  })

  it('форматирует деньги', () => {
    expect(formatMoney('100').replace(/\s/g, ' ')).toBe('100,00 ₽')
  })
})
