import { useUdrScript } from '@/stores/scripts'
import { useHitekCenterStore } from '@/stores/hitek-center'
import { useServerStore } from '@/stores/servers'
import { useUserStore } from '@/stores/users'
import { useCredentialStore } from '@/stores/credentials'

const debug = !__PROD__
const udrScript = useUdrScript()

export async function openUdr(url: string, script: string, params: Record<string, any>) {
  if (url.startsWith('file://'))
    url = url.substring(7)
  return new Promise((resolve, reject) => {
    cordova.plugins.udr.open(
      {
        url,
        initScript: script,
        waitForResult: true,
        appType: 'ilis',
        debug,
        ...params,
      },
      resolve,
      reject,
    )
  })
}

export async function openUdrOnline(url: string, params: Record<string, any>) {
  const hitekCenterStore = useHitekCenterStore()
  const serverStore = useServerStore()
  const credential = useCredentialStore()
  const server = `${serverStore.servers[credential.code].addr}/ilis2`
  await openUdr(
    url,
    udrScript.online,
    {
      server,
      TIS_UDR_ServerURL: hitekCenterStore.udr,
      ...params,
    },
  )
}

export async function openUdrOffline(url: string, params: Record<string, any>) {
  const userStore = useUserStore()
  await openUdr(
    url,
    udrScript.offline,
    {
      dbName: userStore.database,
      // trim prefix 'file://'
      TIS_UDR_ServerURL: cordova.file.dataDirectory.substring(7),
      ...params,
    },
  )
}

export async function openUdrReadonly(url: string, title?: string) {
  return openUdr(url, '', { readOnlyMode: true, title })
}
