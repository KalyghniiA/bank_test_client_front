import type { Account } from '../../api/accounts'

/** Счета Ивана Петрова — те же, что в макетах Figma. */
export const mockAccounts: Account[] = [
  {
    id: 'a1b2c3d4-0000-0000-0000-000000007781',
    number: '40817810000000007781',
    type: 'SAVING',
    status: 'ACTIVE',
    balance: '150000.00',
    openedAt: '2026-09-01',
    withdrawalsLeft: 3,
    withdrawalsLimit: 5,
    nextInterestAt: '2026-11-05',
  },
  {
    id: 'a1b2c3d4-0000-0000-0000-000000002345',
    number: '40817810200000002345',
    type: 'DEFAULT',
    status: 'ACTIVE',
    balance: '48210.50',
    openedAt: '2026-02-02',
  },
  {
    id: 'a1b2c3d4-0000-0000-0000-000000004410',
    number: '40817810500000004410',
    type: 'CHECKING',
    status: 'ACTIVE',
    balance: '2300.00',
    openedAt: '2026-08-15',
    overdraftLimit: '10000.00',
  },
]
