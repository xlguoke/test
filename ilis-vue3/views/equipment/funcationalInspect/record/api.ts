import { Modal } from 'ant-design-vue'
import type { EquipmentFunCheckRecordEntity } from './EquipmentFunCheckRecordEntity.ts'
import type { IPageModel } from '~/interface/IPageModel'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { ILISHTTPError } from '~/types'

export enum StatusType {
  填写中 = 'IN_FILLING',
  待提交 = 'PENDING_SUBMIT',
  审核中 = 'UNDER_REVIEW',
  未通过 = 'NOT_APPROVED',
  已完成 = 'COMPLETED',
}

export const StatusTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '进行中', key: StatusType.填写中 },
  { label: '待提交', key: StatusType.待提交 },
  { label: '审核中', key: StatusType.审核中 },
  { label: '未通过', key: StatusType.未通过 },
  { label: '已通过', key: StatusType.已完成 },
])

export class GetRecordListParams {
  checkEndDate?: string
  checkStartDate?: string
  departmentId?: string
  order?: string
  q?: string
  sort?: string
  status?: StatusType
}

/**
 * # 获取核查计划记录列表
 */
export function getRecordList(query: GetRecordListParams) {
  return IlisApiHelper.get<IPageModel<EquipmentFunCheckRecordEntity>>('rest/equipment/function/check/pagination', query)
}

/**
 * # 导出核查计划记录
 */
export function exportRecord(query: GetRecordListParams) {
  return ilisAxios.get<any>('rest/equipment/function/check/export', {
    params: query,
    responseType: 'blob',
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      Modal.error({
        title: '提示',
        content: err.message,
        centered: true,
        okText: '确定',
      })
    }
    throw err
  })
}

export interface PlanAvailableItem {
  id: '2c912081944ee5c501944f294833002c'
  code: 'GNHC-JH-202501100001'
  name: '2025第一次设备功能核查计划'
  description: '第一次哟'
  planDate: '2025-01-10 ~ 2025-01-31'
  amount: 2
  status: 'COMPLETED'
  createName: '管理员'
  createDate: 1736494893000
  progress: 1
}

/**
 * # 查询进度没有完成的计划
 */
export function getPlanAvailable(query: { page: number, size: number }) {
  return IlisApiHelper.get<PlanAvailableItem>('rest/equipment/function/check/plan/available', query)
}

export interface GetSelectEqParams {
  departmentId?: string
  page?: number
  planId?: string
  q?: string
  size?: number
}

export interface GetSelectEqEntity {
  checkId: null
  planId: '2c912081944ee5c501944f294833002c'
  planDetailId: '2c912081944ee5c501944f294834002d'
  equipmentId: '2c91208188f1bf320188f1d9359701a6'
  equipmentName: '微机控制压力试验机'
  equipmentCode: 'GC-J-007'
  department: '蜀道投资集团有限责任公司'
  standard: 'WHY-3000'
  buyDate: '2014-06-18'
  checkDepartmentId: '2c9284d5767eda4a01768438f1f4009e'
  checkDepartment: '科技设备处'
  checkUserId: '2c9120818653b8db018653caaaf40003'
  checkUser: '燕青'
  checkItems: Array<{
    id: '2c912081944ee5c501944f294834002e'
    type: 'PLAN'
    relationId: '2c912081944ee5c501944f294834002d'
    dictId: '4658f4f66f4640d29e3d8c01bd4cc29a'
    name: '窦家黎明即起，洒扫庭除，要内外整洁明'
    value: null
  }>
  remark: 'tempor elit nisi veniam dolor'
  status: null
}

export interface SelectEqItem {
  checkId?: string
  planId?: string
  planDetailId?: string
  equipmentId: '2c91208188f1bf320188f1d93422017c'
  equipmentName: '微机控制电液伺服万能试验机'
  equipmentCode: 'GC-J-004'
  department: '蜀道投资集团有限责任公司'
  departmentId: string
  standard: 'WAW-1000'
  buyDate: '2014-06-18'
  checkDepartmentId?: string
  checkDepartment?: string
  checkUserId?: string
  checkUser?: string
  checkItems?: any[]
  remark?: string
  status?: string
  lastCheckStartDate: '2025-01-01'
  lastCheckEndDate: '2025-01-05'
}

/**
 * # 查询可以选择的设备信息
 */
export function getSelectEq(query: GetSelectEqParams) {
  return IlisApiHelper.get<IPageModel<SelectEqItem>>('rest/equipment/function/check/plan/equipment', query)
}

/**
 * 核查内容
 */
export class AddCheckEntity {
  id?: string
  ids?: string[]
  /**
   * 核查部门
   */
  checkDepartment?: string
  /**
   * 核查部门ID
   */
  checkDepartmentId?: string
  /**
   * 核查结束日期
   */
  checkEndDate?: string
  /**
   * 核查项目
   */
  checkItems?: EquipmentFunctionCheckItemDTOOnCreate[] = []
  /**
   * 核查结论
   */
  checkResult?: string
  /**
   * 核查开始日期
   */
  checkStartDate?: string
  /**
   * 核查人
   */
  checkUser?: string
  /**
   * 核查人ID
   */
  checkUserId?: string
  /**
   * 设备ID
   */
  equipmentId = ''
  /**
   * 计划明细ID
   */
  planDetailId?: string
  /**
   * 计划ID
   */
  planId?: string
  /**
   * 备注
   */
  remark?: string
}

/**
 * 设备功能核查项目 数据流转对象
 *
 * EquipmentFunctionCheckItemDTOOnCreate
 */
export interface EquipmentFunctionCheckItemDTOOnCreate {
  /**
   * 字典ID(t_s_type.id)
   */
  dictId?: string
  /**
   * 检查项目名称
   */
  name?: string
  /**
   * 检查结果
   */
  value?: string
}

/**
 * # 获取详情
 */
export function getRecordDetail(id: string) {
  return IlisApiHelper.get<AddCheckEntity>(`rest/equipment/function/check/${id}`)
}

/**
 * # 新增核查
 */
export function addCheck(data: { checks: AddCheckEntity[] }) {
  return IlisApiHelper.post<any>(`rest/equipment/function/check`, data)
}

/**
 * # 编辑核查
 */
export function updateCheck(data: AddCheckEntity) {
  return IlisApiHelper.put<any>(`rest/equipment/function/check`, data)
}

/**
 * # 批量编辑核查
 */
export function batchUpdateCheck(data: AddCheckEntity) {
  return IlisApiHelper.put<any>(`rest/equipment/function/check/batch`, data)
}

/**
 * # 删除核查
 */
export function delCheck(id: string) {
  return IlisApiHelper.delete<any>(`rest/equipment/function/check/${id}`)
}

/**
 * # 撤回核查
 */
export function revokePlan(id: string) {
  return IlisApiHelper.get<any>(`rest/equipment/function/check/revoke/${id}`)
}

/**
 * 提交数据
 *
 * SubmitData
 */
export interface SubmitCheckEntity {
  id: string
  /**
   * 预设审核员
   */
  presetAuditors?: PresetAuditer[]
  /**
   * 流程表单数据
   */
  processForm?: string
}

/**
 * 流程人员预设对象
 *
 * PresetAuditer
 */
export interface PresetAuditer {
  /**
   * 流程节点id
   */
  activitiNodeId?: string
  /**
   * 用户部门
   */
  department?: string
  /**
   * 预设人员的ID
   */
  presetUserId?: string
  /**
   * 预设人员登录名
   */
  presetUsername?: string
  /**
   * 预设人员的真实姓名
   */
  presetUserRealName?: string
  /**
   * 流程任务名称
   */
  processTaskName?: string
}

/**
 * # 提交核查审核申请
 */
export function submitCheck(data: SubmitCheckEntity) {
  return IlisApiHelper.post<any>(`rest/equipment/function/check/submit`, data)
}
