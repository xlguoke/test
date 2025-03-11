import type { StandardCheckNewEntity } from './listEntity'
import type { STANDARD_TYPE } from '~/types/standard'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 查新记录列表查询参数 */
export interface RecordListParam {
  /** 模糊查询 */
  q?: string
  /** 规程查新id */
  standardCheckNewId: string
  /** 规程类型 */
  standardType: STANDARD_TYPE
  /** 状态 */
  status: string
  /** 查询日期 */
  checkDate: string
  /** 更新后的规程执行日期 */
  newStandardExecuteDate: string
}

/**
 * 分页列表
 */
interface PageListParam {
  q?: string
}
export function pageListApi(params: PageListParam) {
  return IlisApiHelper.get<any>('rest/standard/check/new/pagination', params)
}

/**
 * 详情
 */
export function detailApi(id: string) {
  return IlisApiHelper.get<any>(`rest/standard/check/new/${id}`)
}

/**
 * 保存数据
 */
interface SaveParam {
  id?: string
  name: string
}
export function saveApi(params: SaveParam) {
  const method = params.id ? 'put' : 'post'
  return IlisApiHelper[method]<any>('rest/standard/check/new', params)
}

/**
 * 删除数据
 * @description 删除数据调用的通用方法，参数需要传数组
 */
export function deleteApi(data: StandardCheckNewEntity[]) {
  return IlisApiHelper.delete<any>(`rest/standard/check/new/${data[0].id}`)
}

/**
 * 撤回数据
 */
export function revokeApi(id: string) {
  return IlisApiHelper.get<any>(`rest/standard/check/new/revoke/${id}`)
}

/**
 * 提交审核
 */
interface SubmitAuditParam {
  ids: string[]
  /** 预设审计员 */
  presetAuditors: {
    /** 流程节点id */
    activitiNodeId: string
    /** 预设人员的ID */
    presetUserId: string
    /** 预设人员登录名 */
    presetUsername: string
    /** 预设人员的真实姓名 */
    presetUserRealName: string
    /** 流程任务名称 */
    processTaskName: string
  }
  /** 流程表单数据 */
  processForm: {
    key: object
  }
}
export function submitAuditApi(data: SubmitAuditParam) {
  return IlisApiHelper.post<any>(`rest/standard/check/new/submit`, data)
}

/**
 * 查新状态描述
 */
export function checkNewStatusDescribe(id: string) {
  return IlisApiHelper.get<any>(`rest/standard/check/new/status/${id}`)
}
