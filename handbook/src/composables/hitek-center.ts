import { watchEffect } from 'vue'
import { z } from 'zod'
import { normalizeHitekCenterUrl } from 'custodian'
import { useNetwork } from './network'
import { useHitekCenterStore } from '@/stores/hitek-center'
import { request } from '@/axios'

const network = useNetwork()

export function useHitekCenter(fn: ({ api, udr }: { api: string, udr: string }) => void) {
  const hitekCenterStore = useHitekCenterStore()

  const fresh = () => {
    if (network.online) {
      request({
        url: '/ilis2/rest/hitek/server',
        schema: z.object({
          hitekApiServer: z.string(),
          hitekUdrServer: z.string(),
        }),
      })
        .then((data) => {
          hitekCenterStore.api = normalizeHitekCenterUrl(data.hitekApiServer)
          hitekCenterStore.udr = normalizeHitekCenterUrl(data.hitekUdrServer)
          fn(hitekCenterStore)
        })
        .catch(err => console.error(`failed to fetch hitek center server info ${err}`))
    }
  }

  watchEffect(() => {
    fresh()
  })
  return { ...hitekCenterStore }
}
