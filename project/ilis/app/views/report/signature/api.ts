import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** # 设置自定义坐标(只传入用户自定义过的位置)DTO */
export interface ISetSignaturePositionDTO {
  /** 报告id */
  reportId: string
  /** 报告文件id */
  reportFileId: string
  /** 文件唯一标识ID */
  reportFileMarkId: string
  /** 印章ID */
  sealId: string
  /** 坐标X */
  locationX: number
  /** 坐标Y */
  locationY: number
  /** 页码 */
  pageNum: number
}

/** # 报告文件的文件信息(含印章) */
export interface IReportSignatureFile {
  reportId: string
  reportFileId: string
  reportFileMarkId: string
  attachmentId: string
  attachmentUrl: string
  attachmentName: string
  pagePositions: IReportSignatureFilePosition[]
}

/** # 报告文件的印章位置信息 */
export interface IReportSignatureFilePosition {
  reportId: string
  reportFileId: string
  reportMarkId: string
  sealId: string
  locationX: number
  locationY: number
  pageNum: number
  sealUrl: string
  sealName: string
  width: number
  height: number
  direction: 'vertical' | 'horizontal'
  custom: boolean
  echapterInfo: string
}

/** # 通过报告id获取获取报告文件的印章信息(含文件) */
export function getSignatureFileByReportId(reportId: string) {
  return IlisApiHelper.get<IReportSignatureFile[]>(`rest/common-body/report/seal/files/positions/${reportId}`)
}

/** # 设置自定义坐标(只传入用户自定义过的位置) */
export function setSignaturePosition(data: ISetSignaturePositionDTO[]) {
  return IlisApiHelper.post(`rest/common-body/report/seal/custom/positions`, data)
}
