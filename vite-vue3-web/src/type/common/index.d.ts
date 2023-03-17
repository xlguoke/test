// 上传文件
export interface filesType {
  id?: string
  name: string
  url: string // 后端保存的路径
  blobUrl?: string // 前端显示路径
  bucketUri?: string // minio 存储桶路径
  uid?: string | number
  size?: string | number
  type?: string
  thumbUrl?: string
  etag?: string
  version?: string
  loading?: boolean
}

export interface ObjectAny {
  [key: string]: any
}

export interface ObjectString {
  [key: string]: string
}

// 下拉菜单或级联选择
export interface OptType {
  label: string
  value: string
  id: string
  disabled?: boolean
  option?: OptType
}
