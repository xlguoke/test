import { MD5 } from 'crypto-es/lib/md5'
import { z } from 'zod'

const client = z.object({
  /**
   * the name of the client
   */
  name: z.string(),
  /**
   * company code
   */
  code: z.string(),
  /**
   * server information
   */
  server: z.object({
    name: z.string(),
    addr: z.string().url('got an invalid ilis instance server url'),
  }),
})

type Client = z.infer<typeof client>

class ClientQuery {
  private readonly base: string

  constructor(base: string) {
    this.base = base
  }

  /**
   * make an ilis client request
   * @param code ilis company code
   * @return {Client}
   */
  async query(code: string): Promise<Client> {
    const url = new URL(`/api/instances/${code}`, this.base)
    const nonce = Date.now()
    const response = await fetch(url, {
      headers: {
        'X-Auth': 'ilis',
        'X-Auth-Nonce': `${nonce}`,
        'X-Auth-Sign': this.sign(nonce),
      },
    })
    if (response.ok)
      return client.parse(await response.json())
    throw new Error(await response.text())
  }

  private sign(nonce: number) {
    return MD5(`121f42460bc15b2666d84cc6f5de6ed1${nonce}`).toString()
  }
}

/**
 * Create an instance of ilis client query
 * @param auth base path of the ilis authorization center
 */
export function createClientQuery(auth: string): ClientQuery {
  return new ClientQuery(auth)
}
