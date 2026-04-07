import { Modal } from 'ant-design-vue'
import { ILISHTTPError } from '~/types'

// 错误提示
function modalError(msg: string, title?: string) {
  Modal.error({
    title: title || '提示',
    content: msg,
    centered: true,
    okText: '确定',
  })
}

/** 列表查询 */
export interface Query {
  /** 点击日期结束 */
  clickTimeEnd?: string
  /** 点击日期开始 */
  clickTimeStart?: string
  /** 排序方式 */
  order?: string
  /** 当前页码 */
  page?: number
  /** 快捷查询 */
  q?: string
  /** 资质 */
  qualification?: string
  /** 当前页数据条数 */
  size?: string
  /** 排序字段 */
  sort?: string
}

/** 规程列表 */
export interface DataSource {
  /** 样品层级 */
  sampleName: string
  /** 参数名称 */
  paramName: string
  /** 资质类型 */
  qualification: string
  /** 委托人 */
  sampleSender: string
  /** 委托单位 */
  consignUnit: string
  /** 点击时间 */
  clickTime: number
}

/**
 * ## 规程分页列表
 */
export function pageListApi(params: Query) {
  return ilisAxios.get<any>('rest/test/param/click', {
    params,
    headers: {
      paramsIsTrim: true,
    },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 导出记录
 */
export function paramClickExport(params: Query) {
  return ilisAxios.get<any>('rest/test/param/click/export', {
    params,
    responseType: 'blob',
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}
