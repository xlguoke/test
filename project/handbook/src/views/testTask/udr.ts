import { useUdrScript } from '@/stores/scripts'
import { useHitekCenterStore } from '@/stores/hitek-center'
import { useServerStore } from '@/stores/servers'
import { useUserStore } from '@/stores/users'
import { useCredentialStore } from '@/stores/credentials'
import { useSystemConfigStore } from '@/stores/systemConfig'

const debug = !__PROD__
const udrScript = useUdrScript()
/**
 * # 开启日志记录
 * 0: 不记录
 * 1：只记录一次
 * 2：完整记录
 */
export enum UdrlogLevel {
  /** 不记录 */
  NONE = 0,
  /** 只记录一次 */
  ONCE = 1,
  /** 完整记录 */
  FULL = 2,
}

export enum UdrPageType {
  在线UDR = 'online',
  离线UDR = 'offline',
  模板UDR = 'template',
}

export function getUdrStartParams(params: Record<string, any>) {
  if (params.url.startsWith('file://'))
    params.url = params.url.substring(7)

  return {
    waitForResult: true,
    appType: 'ilis',
    debug,
    ...params,
  }
}

// 获取在线UDR启动参数
export async function getUdrOnlineStartParams(params: Record<string, any>) {
  const hitekCenterStore = useHitekCenterStore()
  const serverStore = useServerStore()
  const credential = useCredentialStore()
  const { udrLogLevel } = useSystemConfigStore()
  const userStore = useUserStore()
  const server = `${serverStore.servers[credential.code].addr}/ilis2`
  const iotCredential = await userStore.fetchIotCredential()

  return getUdrStartParams({
    server,
    initScript: udrScript.online,
    TIS_UDR_ServerURL: hitekCenterStore.udr,
    udrLogLevel,
    currentUserId: userStore.id,
    currentUserName: userStore.name,
    tbBaseUrl: iotCredential.url,
    tbUserName: iotCredential.username,
    tbPassword: iotCredential.password,
    // tbUserName: 'api.ilis@scsgjc.com',  // 物联设备测试账户
    // tbPassword: 'ilisapi123', // 物联设备测试账户
    ...params,
  })
}

// 获取离线UDR启动参数
export async function getUdrOfflineStartParams(params: Record<string, any>) {
  const userStore = useUserStore()
  const { udrLogLevel } = useSystemConfigStore()

  return getUdrStartParams({
    initScript: udrScript.offline,
    dbName: userStore.database,
    udrLogLevel,
    currentUserId: userStore.id,
    currentUserName: userStore.name,
    // trim prefix 'file://'
    TIS_UDR_ServerURL: cordova.file.dataDirectory.substring(7),
    ...params,
  })
}

// 获取模板UDR启动参数
export async function getUdrTemplateStartParams(url: string, title?: string) {
  return getUdrStartParams({
    url,
    readOnlyMode: true,
    title,
  })
}
