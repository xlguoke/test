import type { ColumnsType } from 'ant-design-vue/es/table'
import type { IAnalysisData } from '~/interface/IAnalysisData'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { OcrBusinessType } from '~/components/commonOcr/ocrResultMockData'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { DeviceEntity } from '../../DeviceEntity'
import { CertConfirmEntity } from '../confirmList/CertConfirmEntity'
import OcrConfirm from '../confirmList/components/OcrConfirm.vue'
import { EquipmentCheckConfirmEntity } from '../confirmList/EquipmentCheckConfirmEntity'
import { checkAIData } from './api'

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
 * # OCR匹配状态枚举
 */
export enum MatchStatus {
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
 * # OCR匹配状态字典
 */
export const MatchStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: MatchStatus.Waiting,
    label: '待解析',
  },
  {
    key: MatchStatus.Analyzing,
    label: '解析中',
  },
  {
    key: MatchStatus.Success,
    label: '成功',
  },
  {
    key: MatchStatus.Success_Manual,
    label: '成功（手动）',
  },
  {
    key: MatchStatus.Fail,
    label: '失败',
  },
  {
    key: MatchStatus.Confirmed,
    label: '已确认解析结果',
  },
])

/** # OCR解析状态 */
export enum ANALYSIS_STATUS {
  /** 待解析-WAIT */
  WAIT = 'WAIT',
  /** 解析中-PARSING */
  PARSING = 'PARSING',
  /** 解析成功-SUCCESS */
  SUCCESS = 'SUCCESS',
  /** 解析失败-FAIL */
  FAIL = 'FAIL',
}

export const ANALYSIS_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  { label: '待解析', key: ANALYSIS_STATUS.WAIT },
  { label: '解析中', key: ANALYSIS_STATUS.PARSING },
  { label: '解析成功', key: ANALYSIS_STATUS.SUCCESS },
  { label: '解析失败', key: ANALYSIS_STATUS.FAIL },
])

/** # OCR解析状态字典 */

const commonColumns: ColumnsType = [
  {
    title: '文件名',
    dataIndex: 'attachmentName',
    key: 'attachmentName',
    width: '300px',
    ellipsis: true,
    fixed: 'left',
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
    title: '匹配状态',
    dataIndex: 'certEqMatchStatus',
    key: 'certEqMatchStatus',
    width: '120px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return MatchStatusDict.getLabelByKey(text)
    },
  },
  {
    title: '解析状态',
    dataIndex: 'ocrStatus',
    key: 'ocrStatus',
    width: '120px',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return ANALYSIS_STATUS_DICT.getLabelByKey(text)
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
  certEqMatchStatus: MatchStatus.Waiting,
}

export type OcrRecordEntity = typeof data

/**
 * # 查看解析结果
 */
export async function handleCheckAnalysis(row: OcrRecordEntity) {
  // selectedRows.value = [_q]
  // selectedRowKeys.value = [_q.id]
  // showCheckOcrResultModal.value = true
  // const standard = mockData?.checkItemList?.map(i => i.checkBasis)?.filter(Boolean)?.join(',')
  const { data } = await checkAIData(OcrBusinessType.EQUIPMENT_CERT, row.id) as any
  if (!data) {
    message.warning('未获取到解析数据')
    return
  }

  // 添加日期兼容函数
  function formatDate(dateStr: any) {
    if (!dateStr)
      return ''
    return dateStr.replace(/年|月/g, '-').replace(/日/g, '')
  }
  const analysisData: IAnalysisData = {
    attachmentId: row.attachmentId,
    deviceInfo: DeviceEntity.fromJSON({
      // 未匹配到设备的设备信息
      name: data.eqCertOcrResult.equipmentName,
      factorySn: data.eqCertOcrResult.factorySn,
      standard: data.eqCertOcrResult.specifications,
    }),
    certInfo: EquipmentCheckConfirmEntity.fromJSON({
      certificateName: data.eqCertOcrResult.certName,
      certificateSn: data.eqCertOcrResult.certSn,
      checkType: data.eqCertOcrResult.certType,
      checkUnit: data.eqCertOcrResult.checkUnit,
      checkTime: formatDate(data.eqCertOcrResult.checkTime),
      validityDate: formatDate(data.eqCertOcrResult.validityDate),
      remark: data.eqCertOcrResult.checkRemark,
      verdict: data.eqCertOcrResult.checkVerdict,
      gist: data.eqCertOcrResult.checkBasis,
    }),
    certConfirmInfo: (() => {
      const items = data?.eqCertOcrResult.checkItemList?.map((i: any) => {
        // 设备的检测参数与证书中的参数是否匹配
        const matched = data.checkItems?.some(
          (item: any) => item.name === i.checkItemName,
        )
        // 找到匹配的系统维护项
        const systemItem = data.checkItems?.find(
          (item: any) => item.name === i.checkItemName,
        )

        // 根据匹配结果返回不同的数据源
        return {
          checkItemName: systemItem?.name || i.checkItemName,
          applyRegulations: systemItem?.regulations || i.checkBasis,
          skillLimit: systemItem?.limit || i.checkRequirements,
          // confirmResults: systemItem?.results || i.confirmResult,
          checkedInfo: systemItem?.info || i.checkResult,
          remark: systemItem?.remark || i.remark,
          matched,
        }
      }) || []
      // 根据 Matched 属性排序：true 在前，false 在后
      return CertConfirmEntity.fromJsonArray(
        [...items].sort((a, b) => Number(b.matched) - Number(a.matched)),
      )
    })(),
  }
  // 匹配到设备，展示返回的设备信息
  if (data.equipmentMatched) {
    analysisData.deviceInfo = DeviceEntity.fromJSON(data.equipment)
  }
  await AnyDialogHelper.showModel(OcrConfirm, { isReadonly: true, analysisData, equipmentMatched: data.equipmentMatched, rowData: row })
}
