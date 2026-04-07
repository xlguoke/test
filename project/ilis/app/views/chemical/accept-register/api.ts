import type { AxiosResponse } from 'axios'
import type {
  AcceptRegisterDetail,
  AcceptRegisterPageParams,
  AcceptRegisterPageResult,
  CreateAcceptRegisterRequest,
  RevokeAcceptRegisterParams,
  SubmitAcceptRegisterRequest,
  UpdateAcceptRegisterRequest,
  VerifyAcceptRegisterRequest,
} from './types'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 分页查询验收登记列表
 */
export function getAcceptRegisterPage(
  params: AcceptRegisterPageParams,
): Promise<AxiosResponse<AcceptRegisterPageResult>> {
  return IlisApiHelper.get('/chemical/purchase/register/pagination', params)
}

/**
 * # 获取验收登记详情
 */
export function getAcceptRegisterDetail(
  id: string,
): Promise<AxiosResponse<AcceptRegisterDetail>> {
  return IlisApiHelper.get(`/chemical/purchase/register/${id}`)
}

/**
 * # 新增验收登记
 */
export function createAcceptRegister(
  data: CreateAcceptRegisterRequest,
): Promise<AxiosResponse<string>> {
  return IlisApiHelper.post('/chemical/purchase/register', data)
}

/**
 * # 更新验收登记
 */
export function updateAcceptRegister(
  data: UpdateAcceptRegisterRequest,
): Promise<AxiosResponse<void>> {
  return IlisApiHelper.put('/chemical/purchase/register', data)
}

/**
 * # 验收提交
 */
export function verifyAcceptRegister(
  data: VerifyAcceptRegisterRequest,
): Promise<AxiosResponse<void>> {
  return IlisApiHelper.put('/chemical/purchase/register/verify', data)
}

/**
 * # 提交审核
 */
export function submitAcceptRegister(
  data: SubmitAcceptRegisterRequest,
): Promise<AxiosResponse<void>> {
  return IlisApiHelper.post('/chemical/purchase/register/submit', data)
}

/**
 * # 撤回申请
 */
export function revokeAcceptRegister(
  params: RevokeAcceptRegisterParams,
): Promise<AxiosResponse<void>> {
  return IlisApiHelper.get('/chemical/purchase/register/revoke', params)
}

/**
 * # 批量删除明细
 */
export function batchDeleteAcceptRegisterItems(
  ids: string[],
): Promise<AxiosResponse<void>> {
  return IlisApiHelper.delete('/chemical/purchase/register/items/batch', ids)
}

/**
 * # 删除单条明细
 */
export function deleteAcceptRegisterItem(
  itemId: string,
): Promise<AxiosResponse<void>> {
  return IlisApiHelper.delete(`/chemical/purchase/register/items/${itemId}`)
}
