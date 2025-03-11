import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import type { IDeviceEntity } from '~/interface/IDeviceEntity'
import type { IDictByBackend } from '~/interface/IDictByBackend'
import type { IOrgEntity } from '~/interface/IOrgEntity'
import type { FunctionType, IPermissionAllEntity, IPermissionEntity } from '~/interface/IPermissionEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { ScreenTypeEntity } from '~/views/admin/screen/configuration'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'

/**
 * # 获取设备分页列表
 */
export function getDeviceList(obj: Record<string, any>) {
  if (obj.buyDateSearch?.length) {
    obj.buyDateBegin = obj.buyDateSearch[0] || undefined
    obj.buyDateEnd = obj.buyDateSearch[1] || undefined
    delete obj.buyDateSearch
  }
  if (obj.checkDateSearch?.length) {
    obj.checkDateBegin = obj.checkDateSearch[0] || undefined
    obj.checkDateEnd = obj.checkDateSearch[1] || undefined
    delete obj.checkDateSearch
  }
  if (obj.nextCheckDateSearch?.length) {
    obj.nextCheckDateBegin = obj.nextCheckDateSearch[0] || undefined
    obj.nextCheckDateEnd = obj.nextCheckDateSearch[1] || undefined
    delete obj.nextCheckDateSearch
  }
  return ilisAxios.get<{ total: number, rows: IDeviceEntity[] }>('/equipmentNewController.do?datagrid', {
    params: obj,
  })
}

/**
 * # 获取子设备列表（不分页）
 */
export function getSubDeviceList(chiefEqId: string) {
  return ilisAxios.get<{ total: number, rows: IDeviceEntity[] }>(`/rest/equipment/pack/suit/${chiefEqId}`)
}

/**
 * # 获取部门树结构数据
 */
export function getOrgComboTree() {
  return ilisAxios.get<IDepartmentEntity[]>('/orgController.do?getOrgComboTree', {
  })
}

/**
 * # 获取部门树、项目树结构数据（部门、项目选择器用）
 */
export function getProjectOrg() {
  return ilisAxios.get<IDepartmentEntity[]>('/rest/eqTransfer/projectOrg/list', {
  })
}

/**
 * # 获取部门树结构数据(部门选择器用)
 */
export function getOrgList() {
  return ilisAxios.get<IOrgEntity[]>('/rest/tSnCategoryOrgController/getOrgList', {
  })
}

/**
 * # 获取人员数据
 */
export function getPersonsForChoose() {
  return ilisAxios.post<IUserSelectVoEntity[]>('/rest/userController.do?getNowTopOrgUserTrees', {
  })
}

/**
 * # 通用上传请求
 */
export function commonUpload(formData: FormData) {
  return ilisAxios.post <Record<string, any>>('/rest/uploadController.do?upload', formData)
}

/**
 * # 通过编码获取权限
 */
export function getUserFunctionByCode(permissionCode: string) {
  const formData = new FormData()
  formData.append('functionCode', permissionCode)
  return ilisAxios.post<{ obj: IPermissionEntity[] }>('/functionController.do?getUserFunctionByCode', formData)
}

/**
 * # 获取用户执行权限
 * @param functionType  权限类型
 * @param wipeUrlIsNull 是否去除url为空的部分
 */
export function getUserFunctions(functionType: FunctionType, wipeUrlIsNull = true) {
  return ilisAxios.postForm<{ obj: IPermissionAllEntity[] }>('rest/functionController?getUserFunctions', {
    functionType,
    wipeUrlIsNull,
  })
}

/**
 * # 根据字典id获取字典
 */
export function getListByGroupId(id: string) {
  const formData = new FormData()
  formData.append('dictGroupId', id)
  return ilisAxios.post<{ obj: ScreenTypeEntity[] }>('/rest/dictionaryController.do?getListByGroupId', formData)
}

/**
 * # 根据字典类型id获取字典
 */
export function getListByTypeGroupId(typegroupid: string) {
  const url = `/systemController.do?typeGrid&typegroupid=${typegroupid}&field=id,typename,typecode,sourceFrom,orderNumber`
  return ilisAxios.get<any>(url)
}

/**
 * # 根据字典类型获取字典
 */
export function getDictByCode(code: string) {
  return IlisApiHelper.get<IDictByBackend[]>('rest/type/getTypesByGroupCode', {
    groupCode: code,
  })
}

/**
 * # 获取自定义属性配置列表
 */
export function getCustomProperties(customizeType: string) {
  return ilisAxios.get<ICustomProperties[]>(`/rest/common/custom-properties`, {
    params: {
      customizeType,
    },
  })
}

/**
 * # 获取选中自定义列
 */
export function getChosenColumns(type: string) {
  return ilisAxios.get<Record<string, any>[]>(`/rest/common/chosen-columns`, {
    params: {
      type,
    },
  })
}

/**
 * # 获取当前登录用户信息
 */
export function getCurrentUserInfo() {
  return IlisApiHelper.get<any>(`userController.do?getCurrentUser`)
}

/**
 * # 获取功能室列表
 */
export function getListLaboratory(query?: Record<string, any>) {
  return IlisApiHelper.get<any>(`laboratoryController.do?listLaboratory`, query)
}

/**
 * # 获取进度消息需要的key
 */
export function getProgressKey(symbol: string) {
  return IlisApiHelper.get<string>('/rest/progressMsg/getBusinessKey', { ids: symbol })
}

/**
 * # 获取进度消息（用于龟速导入之类的）
 */
export function getProgressMsg(obj: { businessKey: string, type: string }) {
  return IlisApiHelper.get<string>('/rest/progressMsg/getProgressMsg', obj)
}
