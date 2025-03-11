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

  if (res.data.obj === 'Y') {
    cacheBusinessParam[key] = true
  }
  else {
    cacheBusinessParam[key] = false
  }

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
