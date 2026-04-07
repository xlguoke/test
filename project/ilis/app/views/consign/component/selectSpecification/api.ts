import { Modal } from 'ant-design-vue'
import { ILISHTTPError } from '~/types'

/**
 * ## 显示类型
 */
export enum VIEW_TYPE {
  /**
   * 添加
   */
  ADD = 'add',
  /**
   * 编辑
   */
  EDIT = 'edit',
  /**
   * 详情
   */
  DETAIL = 'detail',
}

/**
 * ## 显示类型
 */
export type _VIEW_TYPE_ = VIEW_TYPE.ADD | VIEW_TYPE.EDIT | VIEW_TYPE.DETAIL

/**
 * ## 规格型号
 */
export interface Specifications {
  /** 别名 */
  alias?: string
  isNotNull?: boolean
  inputHistory: string[]
  orderNo: number
  consignRemark?: boolean
  displayName: string
  dataType?: number
  testDataProcess?: boolean
  parentID?: string
  systemFieldName: string
  isDefaultValue?: boolean
  listValue?: string
  infoType?: number
  isDesignValue?: boolean
  isJoinSpecification?: boolean
  name?: string
  isShowTest?: boolean
  customized: boolean
  id?: string
  attributeId: string
  value?: string
  deleteAble?: boolean
}

/**
 * ## 保存规格型号时输出的数据
 */
export interface SpecificationsInfo {
  /** 完整明细数据 */
  specifications: Specifications[]
  /** 规格型号 - 组合值 */
  standard: string
  /** 规格型号 - 规格 */
  specification: string
  /** 规格型号 - 等级 */
  grade: string
  /** 规格型号 - 标号 */
  label: string
  /** 规格型号 - 型号 */
  model: string
}

// 错误提示
function modalError(msg: string, title?: string) {
  Modal.error({
    title: title || '提示',
    content: msg,
    centered: true,
    okText: '确定',
  })
}

/**
 * ## 获取当前样品最后一次保存的规格型号
 */
export function getLastConfig(sampleId: string) {
  return ilisAxios.get<Specifications[]>('/specification/config.do', {
    params: { sampleId },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    return Promise.reject(err)
  })
}

/**
 * ## 保存规格型号
 */
export function saveConfig(sampleId: string, config: Specifications[]) {
  return ilisAxios.postForm<any>('specification/saveOrUpdate.do', {
    sampleId,
    configData: JSON.stringify(config),
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    return Promise.reject(err)
  })
}
