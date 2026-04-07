import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 外带设备打包导入模板 */
export function downloadTemplate() {
  return IlisApiHelper.get<any>(`rest/equipment/pack?downloadTemplate`)
}

/** 外带设备打包导入模板 */
export function importParameterPackag(data: { file: File }) {
  return IlisApiHelper.postForm<any>(`rest/equipment/pack/import`, data)
}
