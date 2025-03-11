import { Modal } from 'ant-design-vue'
import type { EquipmentFunCheckPlanEntity } from './EquipmentFunCheckPlanEntity.ts'
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
  { label: '填写中', key: StatusType.填写中 },
  { label: '待提交', key: StatusType.待提交 },
  { label: '审核中', key: StatusType.审核中 },
  { label: '未通过', key: StatusType.未通过 },
  { label: '已通过', key: StatusType.已完成 },
])

export class GetPlanListParams {
  q?: string
  status?: StatusType
}

/**
 * # 核查计划列表
 */
export function getPlanList(query: GetPlanListParams) {
  return IlisApiHelper.get<IPageModel<EquipmentFunCheckPlanEntity>>('rest/equipment/function/check/plan/pagination', query)
}

/**
 * # 核查计划详情
 */
export function getPlanDetail(id: string) {
  return IlisApiHelper.get<any>(`rest/equipment/function/check/plan/${id}`)
}

/**
 * # 导出核查计划
 */
export function exportPlan(query: GetPlanListParams) {
  return ilisAxios.get<any>('rest/equipment/function/check/plan/export', {
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

/**
 * 新增计划实体
 */
export class AddPlanEntity {
  id?: string
  /**
   * 核查说明
   */
  description?: string
  /**
   * 计划内容
   */
  details: EquipmentFunctionCheckPlanDetailDTOOnCreate[] = []
  planDate?: string[]
  /**
   * 结束日期
   */
  endDate: string = ''
  /**
   * 计划名称
   */
  name: string = ''
  /**
   * 开始日期
   */
  startDate: string = ''
}

/**
 * 设备功能核查计划项目 数据流转对象
 *
 * EquipmentFunctionCheckPlanDetailDTOOnCreate
 */
export class EquipmentFunctionCheckPlanDetailDTOOnCreate {
  /**
   * 核查部门
   */
  checkDepartment?: string
  /**
   * 核查部门ID
   */
  checkDepartmentId?: string
  /**
   * 核查项目
   */
  checkItems: EquipmentFunctionCheckItemDTOOnCreate[] = []
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
  equipmentName = ''
  equipmentCode = ''
  standard = ''
  department = ''
  id?: string
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
export class EquipmentFunctionCheckItemDTOOnCreate {
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
 * # 新增核查计划
 */
export function addPlan(data: AddPlanEntity) {
  return IlisApiHelper.post<any>(`rest/equipment/function/check/plan`, data)
}

/**
 * # 编辑核查计划
 */
export function updatePlan(data: AddPlanEntity) {
  return IlisApiHelper.put<any>(`rest/equipment/function/check/plan`, data)
}

/**
 * # 删除核查计划
 */
export function delPlan(id: string) {
  return IlisApiHelper.delete<any>(`rest/equipment/function/check/plan/${id}`)
}

/**
 * # 撤回核查计划
 */
export function revokePlan(id: string) {
  return IlisApiHelper.get<any>(`rest/equipment/function/check/plan/revoke/${id}`)
}

/**
 * 提交数据
 *
 * SubmitData
 */
export interface SubmitPlanEntity {
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
 * # 提交核查计划
 */
export function submitPlan(data: SubmitPlanEntity) {
  return IlisApiHelper.post<any>(`rest/equipment/function/check/plan/submit`, data)
}
