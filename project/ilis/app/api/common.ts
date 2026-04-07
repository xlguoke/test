import type { CustomMarkManagePage, MarkTypeCode } from '~/components/ilisComponent'
import type { ICustomMark } from '~/interface/ICustomMark'
import type { IDepartmentEntity, IProjectOrgEntity } from '~/interface/IDepartmentEntity'
import type { IDeviceEntity } from '~/interface/IDeviceEntity'
import type { IDictByBackend } from '~/interface/IDictByBackend'
import type { IOrgEntity } from '~/interface/IOrgEntity'
import type { FunctionType, IPermissionAllEntity, IPermissionEntity } from '~/interface/IPermissionEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import type { ScreenTypeEntity } from '~/views/admin/screen/configuration'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'
import type { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

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
  if (obj?.egressStatus?.length && Array.isArray(obj.egressStatus)) {
    obj.egressStatus = obj.egressStatus.join(',')
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
 * # 根据设备id数组获取设备信息列表
 */
export function getDeviceListByIds(ids: string[]) {
  return IlisApiHelper.post<DeviceEntity[]>('/rest/equipmentNewController/get', { id: ids.join(',') })
}

/**
 * # 获取部门树结构数据
 */
export async function getOrgComboTree(params?: any) {
  const res = await IlisApiHelper.get<IDepartmentEntity[]>('rest/department/tree', params)
  // 通用接口变更，兼容已使用该方法的地方
  ;(function _each(arr: any[]) {
    arr.forEach((item) => {
      item.text = item.name
      if (item.children) {
        _each(item.children)
      }
    })
  })(res.data || [])
  return res
}

/**
 * # 获取部门树、项目树结构数据（部门、项目选择器用）
 */
export function getProjectOrg() {
  return ilisAxios.get<IProjectOrgEntity[]>('/rest/eqTransfer/projectOrg/list', {
  })
}

/**
 * # 获取部门树结构数据(部门选择器用)
 */
export function getOrgList() {
  return ilisAxios.get<IOrgEntity[]>('/rest/tSnCategoryOrgController/getOrgList', {
  })
}

export interface PersonChooseParam {
  /** 职能权限id */
  type?: string
  /** 参数id，半角逗号分隔 */
  paramIds?: string
  authCode?: string
}

/**
 * # 获取人员数据
 * @description 参数职能权限：要么不传参数，要么同时传入type、paramIds两个参数
 */
export function getPersonsForChoose(parmas: PersonChooseParam) {
  return ilisAxios.postForm<IUserSelectVoEntity[]>('/reportCreateController.do?getPersonsForChoose', parmas)
}

/**
 * # 获取人员数据
 * @description 职能权限、参数职能权限，只需传入 type
 */
export function getPersonsByAuthority(params: PersonChooseParam) {
  if (!params.type)
    params.type = ''
  return ilisAxios.get<IUserSelectVoEntity[]>('/reportCreateController.do?getPersonsByAuthority', { params })
}

/**
 * # 查询审核权限对应的全部人员和部门组成的树，忽略权限生效部门
 * @description 审核权限authCode
 * 注意：部分功能模块使用组件式的PersonSelector接口仅作为人员选择，不涉及流程审核人员选择，需要兼容原来的getPersonsForChoose接口
 */
export function getauthUserTreelgnoreDepart(params: PersonChooseParam) {
  if (!params.authCode) {
    return ilisAxios.postForm<{ total: number, rows: IUserSelectVoEntity[] }>('/reportCreateController.do?getPersonsForChoose', params)
  }
  return ilisAxios.get<{ total: number, rows: IUserSelectVoEntity[] }>(`/rest/auditAuthorityController/authUserTreeIgnoreDepart?authCode=${params.authCode}`)
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
  return ilisAxios.post<{ success: boolean, obj: IPermissionEntity[] }>('/functionController.do?getUserFunctionByCode', formData)
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
  return IlisApiHelper.get<string>('/rest/progress/business-key', { ids: symbol })
}

/**
 * # 获取进度消息（用于龟速导入之类的）
 */
export interface ProgressData {
  current: number
  total: number
  notice: string
}
export function getProgressMsg(obj: { businessKey: string, type: string }) {
  return IlisApiHelper.get<ProgressData>('/rest/progress', obj)
}

/**
 * # 获取用户列表
 */
export interface GetAccountListQuery {
  page: number
  rows: number
  sort?: string
  order?: string
  type?: string
  realName?: string
  userName?: string
}

export function getAccountList(data: GetAccountListQuery) {
  return IlisApiHelper.post<ProgressData>('/userController.do?datagrid', data, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    params: {
      field: 'id,userName,realName,type,TSDepart_id,userOrgList.tsDepart.departname,userKey,createBy,createDate,updateBy,updateDate,status,deleteFlag,',
    },
  })
}

export function getTestTask(params: Record<string, any>) {
  return IlisApiHelper.post<any>('testTaskController.do?datagrid', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

/** 获取合同列表 */
export function getContractList(params: Record<string, any>) {
  return IlisApiHelper.postForm<any>('contractController.do?datagrid', params)
}

/** # 获取自定义标记列表 */
export function getCustomMarks(managePage: CustomMarkManagePage) {
  return IlisApiHelper.get<{ obj: ICustomMark[] }>('markObjectColorTextController.do?listByManagePageEnable', {
    managePage,
  })
}

export interface CustomMarkDTO {
  objectId: string
  markType: MarkTypeCode
  markObjectColorTextId: string
}

/** # 添加自定义标记 */
export function addCustomMark(data: CustomMarkDTO[]) {
  return IlisApiHelper.post<{ obj: ICustomMark }>('markObjectColorTextRelationController.do?markAdd', data)
}

/** # 取消自定义标记 */
export function cancelCustomMark(data: CustomMarkDTO[]) {
  return IlisApiHelper.delete<{ obj: ICustomMark }>('markObjectColorTextRelationController.do', {}, {
    data,
  })
}

/** # 缓存数据到服务端 */
export function cacheDataToServer(data: Record<string, any>) {
  return IlisApiHelper.post<string>('rest/dictionaryController/putDataInServer', data)
}

/** # 获取缓存到服务端的数据 */
export function getDataFromServer(id: string) {
  return IlisApiHelper.get<any>('rest/dictionaryController/getData', { id })
}
