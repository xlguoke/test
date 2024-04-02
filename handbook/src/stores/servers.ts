import { defineStore } from 'pinia'
import { createClientQuery } from 'custodian'
import { UhbError } from '@/type/errors'

const querier = createClientQuery(__AUTH_BASE__)

interface Servers {
  [key: string]: {
    name: string
    addr: string
  }
}

export class IlisServerQueryError extends UhbError {
  constructor(message: string) {
    super(message)
  }
}

export const useServerStore = defineStore('servers', {
  state: () => {
    return {
      servers: {} as Servers,
    }
  },
  actions: {
    async getServer(code: string) {
      if (code in this.servers)
        return this.servers[code]
      try {
        const server = await querier.query(code)
        this.servers[code] = server.server
        return server.server
      }
      catch (e) {
        if (!__PROD__) {
          return {
            name: 'internal server',
            addr: 'http://192.168.2.65:8080',
          }
        }
        throw new IlisServerQueryError('failed to get ilis server address')
      }
    },
  },
})
