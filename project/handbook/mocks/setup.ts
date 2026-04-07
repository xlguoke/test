import { vi } from 'vitest'

vi.stubGlobal('log4c', {
  getLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
})
