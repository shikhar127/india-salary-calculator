import { act } from 'react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from './App'

describe('App cross-tab CTC sync', () => {
  beforeEach(() => {
    const memoryStore: Record<string, string> = {}
    const storageMock: Storage = {
      getItem: (key: string) => (key in memoryStore ? memoryStore[key] : null),
      setItem: (key: string, value: string) => {
        memoryStore[key] = value
      },
      removeItem: (key: string) => {
        delete memoryStore[key]
      },
      clear: () => {
        Object.keys(memoryStore).forEach((key) => delete memoryStore[key])
      },
      key: (index: number) => Object.keys(memoryStore)[index] ?? null,
      get length() {
        return Object.keys(memoryStore).length
      },
    }
    Object.defineProperty(window, 'localStorage', { value: storageMock, configurable: true })
    Object.defineProperty(globalThis, 'localStorage', { value: storageMock, configurable: true })
    storageMock.setItem('hasSeenOnboarding', 'true')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('propagates CTC changes from Salary tab to Tax tab and back', async () => {
    render(<App />)

    const salaryInput = screen.getByLabelText(/Annual CTC/i) as HTMLInputElement
    await act(async () => {
      fireEvent.change(salaryInput, { target: { value: '12' } })
      await new Promise((resolve) => setTimeout(resolve, 350))
    })

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Tax/i }))
    })

    const taxInput = screen.getByLabelText(/Annual CTC/i) as HTMLInputElement
    await waitFor(() => {
      expect(taxInput.value.replace(/,/g, '')).toBe('1200000')
    })

    act(() => {
      fireEvent.change(taxInput, { target: { value: '1800000' } })
    })

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Salary/i }))
    })

    const salaryInputAfterTaxEdit = screen.getByLabelText(/Annual CTC/i) as HTMLInputElement
    await waitFor(() => {
      expect(salaryInputAfterTaxEdit.value).toBe('18')
    })
  })
})
