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

// 列表数据
export interface DataSource {
  id: string
  /** 委托单位 */
  consignUnit: string
  /** 工程项目 */
  project: string
  /** 视频类型 */
  videoType: string
  /** 申请说明 */
  remark?: string
  /** 申请人 */
  applicant: string
  /** 申请日期 */
  applicationDate: number
  /** 报告编号 */
  reportNumber: string
  /** 审核状态 */
  status: string
  /** 审核人 */
  reviewer: string
  /** 审核日期 */
  reviewerDate: number
  /** 审核说明 */
  opinion: string
}

// 查询参数
export type Query = Partial<Pick<DataSource, 'videoType' | 'status' | 'reviewer' | 'reportNumber'>> & {
  /** 排序字段名 */
  sort?: string
  /** 排序方式 */
  order?: string
  /** true - 待审核，false - 已审核  */
  queryType: boolean
  /** 申请日期 - 用于接收表单绑定值 */
  applicationDate?: [string, string]
  /** 申请日期 - 开始日期 */
  applicationDateBegin?: string
  /** 申请日期 - 结束日期 */
  applicationDateEnd?: string
  /** 审核日期 - 用于接收表单绑定值 */
  reviewerDate?: [string, string]
  /** 审核日期 - 开始日期 */
  reviewerDateBegin?: string
  /** 审核日期 - 结束日期 */
  reviewerDateEnd?: string
  /** 快速查询参数 -委托单位/申请人 */
  quickQryParam?: string
}

// 分页列表
export function pageListApi(params: Query) {
  if (params.applicationDate && params.applicationDate.length === 2) {
    params.applicationDateBegin = params.applicationDate[0]
    params.applicationDateEnd = params.applicationDate[1]
  }
  delete params.applicationDate
  if (params.reviewerDate && params.reviewerDate.length === 2) {
    params.reviewerDateBegin = params.reviewerDate[0]
    params.reviewerDateEnd = params.reviewerDate[1]
  }
  delete params.reviewerDate
  return ilisAxios.get<DataSource>('rest/consignVideoController?datagrid', { params })
}

// 详情
interface DetailParams {
  id: string
}
export function detailApi(params: DetailParams) {
  return ilisAxios.get<{ obj: DataSource }>('rest/consignVideoController?get', { params }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    return Promise.reject(err)
  })
}

// 审核
export interface ApprovalParams {
  /** 视频申请id，多个逗号隔开 */
  ids: string
  /** 审核状态 PASS通过 FAIL不通过 */
  videoStatus: 'PASS' | 'FAIL'
  /** 审核意见 */
  opinion: string
}
export function approvalApi(params: ApprovalParams) {
  return ilisAxios.get<any>('rest/consignVideoController?approval', { params }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message, '审核失败')
    }
    return Promise.reject(err)
  })
}
