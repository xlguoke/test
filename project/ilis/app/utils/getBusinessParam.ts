const cacheBusinessParam: {
  [key: string]: boolean | string
} = {}

/**
 * 获取系统参数
 * 并将获取的参数做页面级缓存（刷新页面后重新获取）
 * @param key 系统参数key
 */
export async function getBusinessParam(key: string): Promise<boolean> {
  if (cacheBusinessParam[key] !== undefined) {
    return cacheBusinessParam[key] as boolean
  }

  const res = await ilisAxios.get('/tSBusinessParamController.do?getBusinessParam', {
    params: { key },
  })

  cacheBusinessParam[key] = res.data.obj === 'Y'

  return cacheBusinessParam[key] as boolean
}

/**
 * 获取系统参数（无需登录）
 * 并将获取的参数做页面级缓存（刷新页面后重新获取）
 * @param key 系统参数key
 * @param unitCode 单位编码
 */
export async function getBusinessParamNotAuth(key: string, unitCode: string): Promise<boolean> {
  if (cacheBusinessParam[key] !== undefined) {
    return cacheBusinessParam[key] as boolean
  }

  const res = await ilisAxios.get(`/rest/sign/business/param/${key}`, {
    headers: {
      'unit-code': unitCode,
    },
  })
  const data = res.data || {}

  cacheBusinessParam[key] = data.value === 'Y'

  return cacheBusinessParam[key] as boolean
}

/**
 * 获取系统参数值
 * 并将获取的参数做页面级缓存（刷新页面后重新获取）
 * @param key 系统参数key
 */
export async function getBusinessParamValue(key: string): Promise<string> {
  if (cacheBusinessParam[key] !== undefined) {
    return cacheBusinessParam[key] as string
  }

  const res = await ilisAxios.get('/tSBusinessParamController.do?getBusinessParam', {
    params: { key },
  })

  cacheBusinessParam[key] = res.data.obj
  return cacheBusinessParam[key] as string
}

/**
 * 批量获取系统参数
 * 并将获取的参数做页面级缓存（刷新页面后重新获取）
 * @param keys 系统参数key集合
 */
export async function getBusinessParams(keys: string[]): Promise<Record<string, string | boolean>> {
  const { data } = await ilisAxios.post('rest/tSBusinessParamController/getBusinesses', keys)

  const obj = data.data || {}

  keys.forEach((key) => {
    cacheBusinessParam[key] = obj[key]
  })

  return obj
}
