import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import api from 'mocks/api'
import admin from 'mocks/admin'
import { setupMockServerWithHandlers } from 'mocks/server'
import { useUserStore } from './users'

setupMockServerWithHandlers([...admin, ...api])

vi.mock('migration', async (importOriginal) => {
  const mod = await importOriginal<typeof import('migration')>()
  return {
    ...mod,
    setupMigrator() {
      return {
        migrate: vi.fn(),
        reset: vi.fn(),
      }
    },
  }
})

describe('user Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  it('requests token', async () => {
    const onRejected = vi.fn()
    const userStore = useUserStore()
    await userStore.login(
      'admin',
      '999999',
      'gfzx',
    ).catch(onRejected)
    expect(onRejected).toBeCalledTimes(0)
    expect(userStore.database).toMatch(/gfzx.*.db/)
  })
})
