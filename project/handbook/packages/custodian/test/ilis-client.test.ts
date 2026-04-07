import { describe, expect, it } from 'vitest'
import { setupMockServerWithHandlers } from '../../../mocks/server'
import handlers from '../../../mocks/admin'
import { createClientQuery } from '../src'

const clientQuery = createClientQuery('https://auth.ilis.cn')

setupMockServerWithHandlers(handlers)

describe('ilis client query', () => {
  it('throws error when query a nonexistent instance', async () => {
    await expect(clientQuery.query('none exist')).rejects.toThrow('Client Not Found')
  })
  it('throws error when query an invalid instance', async () => {
    await expect(clientQuery.query('bar')).rejects.toMatchSnapshot()
  })
  it('returns the correct ilis client brevity information', async () => {
    const result = await clientQuery.query('foo')
    expect(result).toEqual({
      name: 'A valid instance',
      code: 'foo',
      server: {
        name: 'valid instance',
        addr: 'https://pro.ilis.cn',
      },
    })
  })
})
