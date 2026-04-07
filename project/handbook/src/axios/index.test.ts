import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { ZodError } from 'zod'
import { z } from 'zod'
import adminHandlers from 'mocks/admin'
import apiHandler from 'mocks/api'
import { setupMockServerWithHandlers } from 'mocks/server'
import { request } from '.'

setupMockServerWithHandlers([...adminHandlers, ...apiHandler])

describe('axios wrapper', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  it('params: url', async () => {
    const onRejected = vi.fn()
    await request<{ foo: string }>('/api/foo')
      .then((res) => {
        expect(res.foo).toBe('bar')
      }, onRejected)
    expect(onRejected).toBeCalledTimes(0)
  })
  it('params: url, config', async () => {
    const onRejected = vi.fn()
    await request<{ a: string }>('/api/foo', { params: { a: 'b' } })
      .then((res) => {
        expect(res.a).toBe('b')
      }, onRejected)
    expect(onRejected).toBeCalledTimes(0)
  })
  it('params: options', async () => {
    const onRejected = vi.fn()
    await request<{ status: string }, { foo: string }>({
      url: '/api/baz',
      method: 'post',
      data: { foo: 'bar' },
    })
      .then((res) => {
        expect(res.status).toBe('ok')
      }, onRejected)
    expect(onRejected).toBeCalledTimes(0)
  })
  it('parse schema', async () => {
    await request({
      url: '/api/bar',
      schema: z.object({
        bar: z.string(),
      }),
    }).catch(err => expectTypeOf(err).toMatchTypeOf<ZodError>())
  })
  it('throws when receiving a malformed response with code', async () => {
    const onRejected = vi.fn()
    await request('/api/malformed').catch(onRejected)
    expect(onRejected).toHaveBeenCalledOnce()
  })
})
