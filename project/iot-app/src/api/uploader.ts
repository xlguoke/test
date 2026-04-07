import { useUserStore } from '@/stores'
import request from '@/utils/request'
import { toFormData } from 'axios'

export interface AttachmentDTO {
  businessId: string
  businessAttachmentId?: string
  attachmentId: string
  name: string
  format: string
  size: string
  uploader: string
  uploadWay: string
  uploadTime: string
  url: string
  businessObj: string
  historical: boolean
}

export function parseQrCodeUrl(url: string) {
  const usp = new URLSearchParams(url.split('?')[1])
  return usp.get('key') || null
}

export function getQrCode(businessId: string) {
  return request.get<string>('rest/attachmentQR/getQrCode/EQ', {
    params: { businessId },
  })
}

export function getAttachmentByQrCode(qrCode: string, recursion = false) {
  return request.get<AttachmentDTO[]>(`/rest/attachmentQR/attachments/${qrCode}`, {
    params: { recursion },
  })
}

export interface UploadEntity {
  file: File
  qrKey: string | number
  uploadWay: 'WEBPAGE'
  uploader?: string
}

export function upload(data: UploadEntity) {
  if (!data.uploader) {
    const { userInfo } = useUserStore()
    data.uploader = userInfo.realName
  }

  return request.post<any>('/rest/uploadController.do?upload', toFormData(data))
}

export function deleteAttachment(params: { key: string, attachmentId: string }) {
  return request.delete<any>('/rest/attachmentQR/fileDel', {
    params,
  })
}
