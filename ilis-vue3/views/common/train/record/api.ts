import type { TrainRecordEntity } from './TrainRecordEntity'
import type { MaterialEntity } from './component/MaterialEntity'
import { ILISHTTPError } from '~/types'
import { modalError } from '~/views/unit-config/standard/api'

/**
 * # 获取培训记录分页列表
 */
export function getTrainRecordPage(obj: Record<string, any>) {
  return ilisAxios.get<{ count: number, rows: TrainRecordEntity[], total: number }>('/trainRecordController.do?datagrid', {
    params: obj,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 新增编辑培训记录
 */
export function addOrSaveTrainRecord(obj: TrainRecordEntity) {
  return ilisAxios.postForm<any>('/trainRecordController.do?save', obj).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 删除培训记录
 */
export function delTrainRecord(objArr: TrainRecordEntity[]) {
  return ilisAxios.postForm<any>('/trainRecordController.do?del', {
    ids: objArr.map(item => item.id)?.join(','),
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 获取培训记录资料分页列表
 */
export function getTrainRecordFilePage(obj: Record<string, any>) {
  return ilisAxios.get<{ count: number, rows: MaterialEntity[], total: number }>('/trainRecordFileController.do?datagrid', {
    params: obj,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 删除培训记录资料
 */
export function delTrainRecordFiles(objArr: MaterialEntity[]) {
  return ilisAxios.postForm<any>('/trainRecordFileController.do?del', {
    ids: objArr.map(item => item.id)?.join(','),
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * # 上传培训记录资料
 */
export function uploadTrainRecordFiles(obj: Record<string, any>) {
  return ilisAxios.postForm<any>('/trainRecordFileController.do?save', obj).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}
