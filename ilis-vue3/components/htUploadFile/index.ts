import Index from './Index.vue'

export { default as HtUploadFile } from './Index.vue'
export { default as UploadManage } from './component/UploadManage.vue'

export default Index

/** 业务类型 */
export enum BUSINES_TYPE {
  // 委托附件
  CONSIGN = 'CONSIGN',
  // 委托样品附件
  SAMPLE = 'SAMPLE',
}

export interface AttachmentItem {
  attachmentId: string
  businessAttachmentId: string
  businessId: string
  businessObj: string
  format: string
  historical: boolean
  name: string
  size: string
  uploadTime: string
  uploadWay: string
  uploader: string
  url: string
}

export interface UploadFileData {
  qrCodeUrl: string
  qrCodeKey: string
  fileDatas: AttachmentItem[]
}
