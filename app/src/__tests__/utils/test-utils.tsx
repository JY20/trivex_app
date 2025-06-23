import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/context/AuthContext'

// Mock user data for testing
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  stellarPublicKey: 'GACADA5Z35LEQPN7EHN5QPCDEXBNZH2A6DBHBEJOXYHMOJVJBSRWJVCX',
  pioneerBankPublicKey: 'GD5Y7CGKI7PBN7YNFFSS6AWZCRZP3QEMBXX36DTA6RFXZ7JATYCRJFEE',
  preferredCurrency: 'CAD',
  bankAccounts: [
    {
      id: '1',
      bankName: 'Pioneer Bank',
      accountNumber: '1234567890',
      transitNumber: '12345',
      isPioneerBank: true,
      isPrimary: true,
    },
  ],
}

// Mock session data
export const mockSession = {
  user: mockUser,
  isLoggedIn: true,
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock API responses
export const mockApiResponses = {
  balance: {
    balances: [
      {
        asset_type: 'native',
        balance: '1000.0000000',
      },
    ],
  },
  transactions: {
    transactions: [
      {
        id: '1',
        type: 'transfer',
        status: 'completed',
        amount: 100,
        currency: 'CAD',
        timestamp: '2024-01-01T00:00:00Z',
        description: 'Test transaction',
        stellarTransactionId: 'test-hash',
      },
    ],
    stats: {
      totalTransactions: 1,
      totalDeposits: 0,
      totalTransfers: 1,
      totalPayments: 0,
    },
  },
  recipients: [
    {
      id: '1',
      name: 'John Doe',
      publicKey: 'GACADA5Z35LEQPN7EHN5QPCDEXBNZH2A6DBHBEJOXYHMOJVJBSRWJVCX',
      bankName: 'Test Bank',
      accountNumber: '1234567890',
    },
  ],
  users: [
    {
      id: '2',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      stellarPublicKey: 'GACADA5Z35LEQPN7EHN5QPCDEXBNZH2A6DBHBEJOXYHMOJVJBSRWJVCX',
      displayName: 'John Doe',
    },
  ],
}

// Helper function to mock fetch responses
export const mockFetch = (response: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  })
}

// Helper function to wait for async operations
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)) 