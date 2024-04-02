import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import api from 'mocks/api'
import { setupMockServerWithHandlers } from 'mocks/server'
import { useCredentialStore } from './credentials'

setupMockServerWithHandlers(api)

// todo refactor duplicate code
describe('credential store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        servers: {
          servers: {
            fake: {
              name: 'Fake',
              addr: 'https://fake.site',
            },
          },
        },
      },
    }))
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  it('requests token', async () => {
    const onRejected = vi.fn()
    const credentialStore = useCredentialStore()
    await credentialStore.requestToken({
      code: 'fake',
      username: 'admin',
      password: '999999',
    }).catch(onRejected)
    expect(onRejected).toBeCalledTimes(0)
    expect(credentialStore.hasValidCredential()).toBeTruthy()
  })
  it('refreshes token', async () => {
    const onRejected = vi.fn()
    const credentialStore = useCredentialStore()
    await credentialStore.requestToken({
      code: 'fake',
      username: 'admin',
      password: '999999',
    }).catch(onRejected)
    await credentialStore.refresh().catch(onRejected)
    expect(onRejected).toBeCalledTimes(0)
    expect(credentialStore.hasValidCredential()).toBeTruthy()
  })
  it('attempts to refresh token', async () => {
    const credentialStore = useCredentialStore()
    await credentialStore.requestToken({
      code: 'fake',
      username: 'admin',
      password: '999999',
    })
    const timer = new Date(Date.now() + 1.6 * 60 * 60 * 1000)
    vi.setSystemTime(timer)
    await credentialStore.hasValidCredential()
    expect(credentialStore.refresh).toHaveBeenCalledOnce()
  })
})
