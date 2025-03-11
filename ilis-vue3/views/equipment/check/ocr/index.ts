import type { ColumnsType } from 'ant-design-vue/es/table'
import { EDateFormatType } from '~/utils/EDateFormatType'

export { default as Ocr } from './list.vue'

export { default as OcrResult } from '~/components/commonOcr/CheckOcrResult.vue'

/**
 * # 排序方式(正序-ASC/倒序-DESC)枚举
 */
export enum OrderType {
  /**
   * # 正序
   */
  ASC = 'ASC',
  /**
   * # 倒序
   */
  DESC = 'DESC',
}

/**
 * # 申请状态枚举
 */
export enum CheckStatus {
  /**
   * # 填写中
   */
  APPLY_STATUS_WRITING = '10',
  /**
   * # 审批中
   */
  APPLY_STATUS_AUDITING = '20',
  /**
   * # 审批拒绝
   */
  APPLY_STATUS_REFUSE = '30',
  /**
   * # 审批通过
   */
  APPLY_STATUS_PASS = '40',
  /**
   * # 删除
   */
  APPLY_STATUS_DELETE = '-1',
}

/**
 * # 申请状态字典
 */
export const CheckStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: CheckStatus.APPLY_STATUS_WRITING,
    label: '填写中',
  },
  {
    key: CheckStatus.APPLY_STATUS_AUDITING,
    label: '审批中',
  },
  {
    key: CheckStatus.APPLY_STATUS_REFUSE,
    label: '审批拒绝',
  },
  {
    key: CheckStatus.APPLY_STATUS_PASS,
    label: '审批通过',
  },
  {
    key: CheckStatus.APPLY_STATUS_DELETE,
    label: '删除',
  },
])

/**
 * # OCR列表区分字段枚举
 */
export enum OcrQueryType {
  /**
   * # 待确认列表
   */
  WAIT_CONFIRM = 'WAIT_CONFIRM',
  /**
   * # 已确认列表
   */
  CONFIRMED = 'CONFIRMED',
}

/**
 * # OCR证书类型枚举
 */
export enum OcrCertificateType {
  /**
   * # 校准证书
   */
  CALIBRATION = 'CALIBRATION',
  /**
   * # 检定证书
   */
  VERIFICATION = 'VERIFICATION',
}

/**
 * # OCR证书类型字典
 */
export const OcrCertificateTypeDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: OcrCertificateType.CALIBRATION,
    label: '校准证书',
  },
  {
    key: OcrCertificateType.VERIFICATION,
    label: '检定证书',
  },
])

/**
 * # OCR解析状态枚举
 */
export enum AnalysisStatus {
  /**
   * # 待解析
   */
  Waiting = 'WAIT',

  /**
   * # 解析中
   */
  Analyzing = 'PARSING',

  /**
   * # 成功
   */
  Success = 'SUCCESS',

  /**
   * # 成功（手动）
   */
  Success_Manual = 'SUCCESS_MANUAL',

  /**
   * # 失败
   */
  Fail = 'FAIL',

  /**
   * # 已确认解析结果
   */
  Confirmed = 'CONFIRMED',
}

/**
 * # OCR解析状态字典
 */
export const AnalysisStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: AnalysisStatus.Waiting,
    label: '待解析',
  },
  {
    key: AnalysisStatus.Analyzing,
    label: '解析中',
  },
  {
    key: AnalysisStatus.Success,
    label: '成功',
  },
  {
    key: AnalysisStatus.Success_Manual,
    label: '成功（手动）',
  },
  {
    key: AnalysisStatus.Fail,
    label: '失败',
  },
  {
    key: AnalysisStatus.Confirmed,
    label: '已确认解析结果',
  },
])

const commonColumns: ColumnsType = [
  {
    title: '文件名',
    dataIndex: 'attachmentName',
    key: 'attachmentName',
    width: '300px',
    ellipsis: true,
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    key: 'equipmentSn',
    width: '160px',
    ellipsis: true,
  },
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
    width: '200px',
    ellipsis: true,
  },
  {
    title: '证书类型',
    dataIndex: 'certificateType',
    key: 'certificateType',
    width: '120px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return OcrCertificateTypeDict.getLabelByKey(text)
    },
  },
  {
    title: '证书编号',
    dataIndex: 'certificateSn',
    key: 'certificateSn',
    width: '120px',
    ellipsis: true,
  },
  {
    title: '证书结论',
    dataIndex: 'certificateConclusion',
    key: 'certificateConclusion',
    width: '120px',
    ellipsis: true,
  },
  {
    title: '上传用户',
    dataIndex: 'createName',
    key: 'createName',
    width: '120px',
    ellipsis: true,
  },
  {
    title: '上传时间',
    dataIndex: 'createDate',
    key: 'createDate',
    width: '160px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD_HH_MM_SS)
    },
    sorter: true,
  },
  {
    title: '解析状态',
    dataIndex: 'ocrStatus',
    key: 'ocrStatus',
    width: '120px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnalysisStatusDict.getLabelByKey(text)
    },
  },
  {
    title: '检校确认人',
    dataIndex: 'confirmUser',
    key: 'confirmUser',
    width: '120px',
    ellipsis: true,
  },
]

/**
 * # 待确认文件表格列配置
 */
export const columnsListTodo: ColumnsType = [
  ...commonColumns,
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    width: 320,
  },
]

/**
 * # 已确认文件表格列配置
 */
export const columnsListReady: ColumnsType = [
  ...commonColumns,
  {
    title: '检校状态',
    dataIndex: 'eqCheckStatus',
    key: 'eqCheckStatus',
    width: '120px',
    customRender: ({ text }: any) => {
      return CheckStatusDict.getLabelByKey(text)
    },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    width: 230,
  },
]

// ocr解析记录数据实例
// eslint-disable-next-line unused-imports/no-unused-vars
const data = {
  id: '4028b229916d923501916f0363760137',
  sysCompanyCode: 'A03',
  createName: '管理员',
  createBy: 'admin',
  createDate: 1724144379000,
  updateName: null,
  updateBy: null,
  updateDate: null,
  attachmentId: '4028b229916d923501916f035b600136',
  attachmentName: '831c37a7-fc40-4af8-a8c2-fb2aa255e101.pdf',
  attachmentUrl: '',
  equipmentId: null,
  equipmentSn: null,
  equipmentName: null,
  certificateType: null,
  certificateSn: null,
  certificateConclusion: null,
  confirmUser: null,
  confirmUserId: null,
  ocrStatus: 'PARSING',
  eqCheckId: null,
}

export type OcrRecordEntity = typeof data
