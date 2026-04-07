import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'

export function setupMockServerWithHandlers(handlers: any[]) {
  const server = setupServer(...handlers)
  beforeAll(() => server.listen())
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())
}
