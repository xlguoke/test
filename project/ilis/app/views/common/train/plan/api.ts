import type { TrainPlanEntity } from './TrainPlanEntity'
import { ILISHTTPError } from '~/types'
import { modalError } from '~/views/unit-config/standard/api'

/**
 * # 获取培训计划分页列表
 */
export function getTrainPlanPage(obj: Record<string, any>) {
  return ilisAxios.get<{ count: number, rows: TrainPlanEntity[], total: number }>('/trainPlanController.do?datagrid', {
    params: obj,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 新增编辑培训计划
 */
export function addOrSaveTrainPlan(obj: TrainPlanEntity) {
  return ilisAxios.postForm<any>('/trainPlanController.do?save', obj).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 删除培训计划
 */
export function delTrainPlan(objArr: TrainPlanEntity[]) {
  return ilisAxios.postForm<any>('/trainPlanController.do?del', {
    ids: objArr.map(item => item.id)?.join(','),
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}
/**
 * # 提交培训计划
 */
export function submitTrainPlan(obj: Record<string, any>) {
  return ilisAxios.postForm<any>('/trainPlanController.do?submit', obj).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 撤回培训计划
 */
export function revokeTrainPlan(obj: Record<string, any>) {
  return ilisAxios.postForm<any>('/trainPlanController.do?revoke', obj).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 获取培训计划详情
 */
export function getTrainPlanDetail(id: string) {
  return ilisAxios.get<any>(`/trainPlanController.do?getById&id=${id}`).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}
