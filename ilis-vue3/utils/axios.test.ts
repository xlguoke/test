/**
 * Testing an external library is not our responsibility. Axios has its own comprehensive test suite.
 *
 * We should only focus on our own logic.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'

const dummy = {
  foo: 'bar',
}

const handlers = [
  http.get('https://1.top/ajax', () => {
    return HttpResponse.json({
      success: true,
      msg: null,
      obj: dummy,
    })
  }),
  http.get('https://1.top/ajax/error', () => {
    return HttpResponse.json({
      success: false,
      msg: 'AjaxJson error',
      obj: null,
    })
  }),
  http.get('https://1.top/rest', () => {
    return HttpResponse.json({
      code: 20000,
      data: [dummy],
    })
  }),
  http.get('https://1.top/rest/operation', () => {
    return HttpResponse.json({
      code: 21000,
      message: 'Operation performed',
    })
  }),
  http.get('https://1.top/rest/error', () => {
    return HttpResponse.json({
      code: 20010,
      message: 'Restful error',
    })
  }),
]

const server = setupServer(...handlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

describe('axios wrapper instance', () => {
  it('normalize the ancient ajax json', async () => {
    const res = await ilisAxios.get<{ obj: { foo: string } }>('https://1.top/ajax')
    expect(res.data.obj.foo).toBe('bar')
  })

  it('wrap ajax false response to error', async () => {
    await expect(ilisAxios.get('https://1.top/ajax/error')).rejects.toThrow('AjaxJson error')
  })

  it('normalize the restful response', async () => {
    const res = await ilisAxios.get<{ foo: string }>('https://1.top/rest')
    expect(res.data).toEqual([dummy])
  })

  it('wrap restful false response to error', async () => {
    await expect(ilisAxios.get('https://1.top/rest/error')).rejects.toThrow('Restful error')
  })

  it('leave other operation response unchanged', async () => {
    const res = await ilisAxios.get<{ foo: string }>('https://1.top/rest/operation')
    expect(res.data).toEqual({ code: 21000, message: 'Operation performed' })
  })
})
