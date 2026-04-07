import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * ## 根据key获取系统参数
 */
export function getSystemParamByKeyApi(key: string) {
  return IlisApiHelper.get<any>(`/tSBusinessParamController.do?getBusinessParam`, { key })
}

/**
 * ## 根据key获取系统参数（无需登录）
 * @param key 系统参数key
 * @param unitCode 单位编码
 */
export function getSystemParamByKeyNoAuthApi(key: string, unitCode: string) {
  return IlisApiHelper.get<any>(`/rest/sign/business/param/${key}`, {}, {
    headers: {
      'unit-code': unitCode,
    },
  })
}

/**
 * ## 获取所有系统参数
 */
export function getAllSystemParamsApi() {
  return IlisApiHelper.post<any>(`/rest/tSBusinessParamController/all-business`)
}
