import type { Attachment } from '../attachmentList'
import UploadFile from './UploadFile.vue'

export { default as UploadManage } from './component/UploadManage.vue'
export { default as HtUploadFileJsp } from './IndexJsp.vue'
export { default as HtUploadFile } from './UploadFile.vue'

export default UploadFile

/** 业务类型 */
export enum BUSINES_TYPE {
  /** 委托附件 */
  CONSIGN = 'CONSIGN',
  /** 委托样品附件 */
  SAMPLE = 'SAMPLE',
  /** 设备检校参数 */
  EQ = 'EQ',
  /** 用户签字图片 */
  GENERAL = 'GENERAL',
  /** 报告更正 */
  ASSET = 'ASSET',
  /** 设备授权 */
  EQ_IOT_AUTH = 'EQ_IOT_AUTH',
  /** 化学品 */
  CHEMICAL = 'CHEMICAL',
  /** 设备检校确认 - 证书 */
  EQ_CHECK_FILE = 'EQ_CHECK_FILE',
  /** 设备检校确认 - 其他证书 */
  EQ_CHECK_OTHER_FILE = 'EQ_CHECK_OTHER_FILE',
  /** 设备检校确认 - 其他附件 */
  EQ_CHECK_VERDICT_OTHER_FILE = 'EQ_CHECK_VERDICT_OTHER_FILE',
  /** 设备检校确认 - 直接确认表附件 */
  EQ_CHECK_CONFIRM_FILE = 'EQ_CHECK_CONFIRM_FILE',
  /** 设备调拨申请附件 */
  EQ_ALLOT_APPLY = 'EQ_ALLOT_APPLY',
  /** 文件管理 */
  DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
  /** 设备外出 */
  EQ_EGRESS = 'EQ_EGRESS',
  /** 流程表单文件 */
  WORKFLOW_FORM_FILE = 'WORKFLOW_FORM_FILE',
  /** 标准物质 */
  REF_MATERIAL = 'REF_MATERIAL',
  /** 标准物质出库 */
  REF_STOCK_OUT = 'REF_STOCK_OUT',
  /** 标准物质入库 */
  REF_STOCK_IN = 'REF_STOCK_IN',
  /** 标准物质采购验收登记 */
  REF_PURCHASE_ACCEPT_REGISTER = 'REF_PURCHASE_ACCEPT_REGISTER',
  // 默认
  DEFAULT = '',
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

export interface PropData {
  businessId?: string // 业务id
  businessType: BUSINES_TYPE // 业务类型： CONSIGN-委托 SAMPLE-样品
  qrCodeUrl?: string // 二维码路径
  parentKey?: string // 父级附件的二维码key
  recursion?: boolean // 递归查询当前二维码下所有的二维码的附件
  hideFileList?: boolean // 隐藏文件列表
  isReandonly?: boolean // 只读模式
  forceInit?: boolean // 是否强制初始化(传入此参数时，每次打开组件都是全新数据)
  accept?: string[] // 接受上传的文件类型
  pdfPreviewHandler?: (data: Attachment) => void // pdf预览的自定义方法（不传默认新窗口打开）
  orderBy?: string // 排序字段
  order?: string // 排序方式
}

export interface InviteFileData {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: Date
  updateName: string
  updateBy: string
  updateDate: Date
  qrKey: string
  businessId: null
  userId: string
  valid: boolean
  invalidTime: string
  type: string
  coreId: string
  audience: string
  attachmentCount: number
}

/**
 * 邀请上传的文件列表
 */
export const inviteFilecolumns: any[] = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 50,
    customRender: ({ index }: { index: number }) => index + 1,
  },
  {
    title: '上传人员',
    dataIndex: 'audience',
  },
  {
    title: '已上传文件数量',
    dataIndex: 'attachmentCount',
  },
  {
    title: '邀请日期',
    dataIndex: 'createDate',
  },
  {
    title: '有效截止日期',
    dataIndex: 'invalidTime',
  },
  {
    title: '二维码状态',
    dataIndex: 'valid',
    customRender: ({ record }: { record: InviteFileData }) => {
      return record.valid ? '生效中' : '已失效'
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 130,
  },
]
