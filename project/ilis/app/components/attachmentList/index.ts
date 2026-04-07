export { default as AttachmentList } from './AttachmentList.vue'

export interface Attachment {
  name: string
  url: string
  id: string
  attachmentId?: string
  // 附件大小
  size?: number | string
  // 附件类型
  format?: string
}
