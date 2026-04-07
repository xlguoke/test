import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 导入样品参数 */
export function importParam(sampleId: string, file: File) {
  return IlisApiHelper.postForm<any>(`rest/sample/param/structure/import-sample?sampleId=${sampleId}`, { file })
}

export interface FileData {
  id: string
  attachmentId: string
  attachmentName: string
  attachmentUrl: string
  visible?: boolean
}
/** 获取样品信息填写示例 */
export function getSampleExample(sampleId: string) {
  return IlisApiHelper.get<FileData[]>(`rest/sample/example?sampleId=${sampleId}`)
}

/** 获取样品信息填写示例 */
interface SaveSampleExample {
  sampleId: string
  attachmentIds: string[]
}
export function saveSampleExample(data: SaveSampleExample) {
  return IlisApiHelper.post<any>(`rest/sample/example`, data)
}

/** 获取样品信息填写示例 */
export function deleteSampleExample(id: string) {
  return IlisApiHelper.delete<any>(`rest/sample/example?id=${id}`)
}
