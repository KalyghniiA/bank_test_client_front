import { setupServer } from 'msw/node'

// MSW для тестов (Node). Каждый тест сам описывает нужные ответы через server.use(...).
export const server = setupServer()
