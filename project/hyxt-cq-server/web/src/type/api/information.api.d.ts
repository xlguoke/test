export interface queryParType {
  current: number | undefined
  size: number | undefined
  title?: string
  type?: string | null
}

export interface fileType {
  name: string
  url: string
  remark?: string
  id?: string
  name: string
  blobUrl?: string // 前端显示路径
  uid?: string | number
  size?: string | number
  type?: string
  uploadTime?: number // 上传时间
  thumbUrl?: string
  bucketUri?: string
  etag?: string
  version?: string
  loading?: boolean
}

export interface dataItemType {
  customCategory?: string
  id?: string
  type: string | null
  title: string
  content: string
  publishDate: string
  auditedTime?: string
  pictureUrl?: string
  isTop: boolean
  topExpirationDate?: string
  isPicture?: boolean
  isInWebsite?: boolean
  attachments?: fileType[]
  flowRate?: number | null
  status?: string
}
