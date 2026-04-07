// 搜索右侧按钮组件
export interface btnsType {
  btnName: string // 按钮名称
  authCode?: string // 权限编码
  type?: string // 按钮类型
  syncType?: string // 同步类型，多个用逗号隔开
  loading?: Ref<boolean>
  disabled?: Ref<boolean>
  isHide?: Ref<boolean>
  click: () => void // 点击事件
}

// 上传文件
export interface filesType {
  id?: string
  name: string
  url: string // 后端保存的路径
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

export interface ObjectAny {
  [key: string]: any
}

export interface ObjectString {
  [key: string]: string
}
