import { message } from 'ant-design-vue'
import type { AnalysisStatus, OcrRecordEntity } from '.'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import type { IDeviceEntity } from '~/interface/IDeviceEntity'
import { ILISHTTPError } from '~/types'

interface OcrRequest {
  page?: number
  size?: number
  dateStart?: string
  dateEnd?: string
  ocrStatus?: AnalysisStatus
  order?: string
  orderBy?: string
  quickQry?: string
  timeRange?: [string, string]
}

interface UploadResponseEntity {
  id: 'string'
  attachmenttitle: 'string'
}

/**
 * # 获取Ocr分页列表
 */
export function getOcrPage(obj: OcrRequest) {
  obj.dateStart = obj.timeRange?.[0]
  obj.dateEnd = obj.timeRange?.[1]
  obj.timeRange = undefined
  return ilisAxios.get<{ count: number, rows: OcrRecordEntity[], total: number }>('rest/cert-ocr/pagination', {
    params: obj,
  })
}

/**
 * # 新增OCR解析
 */
export function addOcr(data: UploadResponseEntity[], loading?: Ref<boolean>) {
  return ilisAxios.post<any>('rest/cert-ocr/add', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
      if (loading) {
        loading.value = false
      }
    }
    throw err
  })
}

/**
 * # OCR记录绑定设备
 */
export function bindOcrDevice({ ocr, device, loading }: { ocr: OcrRecordEntity, device: IDeviceEntity, loading?: Ref<boolean> }) {
  return ilisAxios.get<any>(`rest/cert-ocr/bind-equipment/${ocr.id}`, {
    params: { equipmentId: device.id },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
      if (loading) {
        loading.value = false
      }
    }
    throw err
  })
}

/**
 * # OCR记录绑定检校确认人
 */
export function bindOcrPerson({ ocrs, person }: { ocrs: OcrRecordEntity[], person: IUserSelectVoEntity }) {
  return ilisAxios.post<any>(`rest/cert-ocr/bind-person`, {
    ocrIds: ocrs.map(i => i.id),
    personId: person.id,
    personName: person.name,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
    }
    throw err
  })
}

/**
 * # 确认OCR记录
 */
export function confirmOcr(data: OcrRecordEntity[]) {
  return ilisAxios.post<any>(`rest/cert-ocr/confirm`, data.map(i => i.id)).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
    }
    throw err
  })
}

/**
 * # 删除解析记录
 */
export function deleteOcr(data: OcrRecordEntity[]) {
  return ilisAxios.delete<any>(`rest/cert-ocr/delete`, {
    data: data.map(i => i.id),
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
    }
    throw err
  })
}

/**
 * # 查看检校详情
 */
export function checkOcrDetail(data: OcrRecordEntity) {
  return ilisAxios.get<any>(`rest/cert-ocr/show-check-detail/${data.id}`).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
    }
    throw err
  })
}
