import type { FunctionType, IPermissionAllEntity } from '@/interface/IPermissionEntity'
import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import request from '@/utils/request'

/**
 * # 获取用户执行权限
 * @param functionType  权限类型
 * @param wipeUrlIsNull 是否去除url为空的部分
 */
export function getUserFunctions(functionType: FunctionType, wipeUrlIsNull = true) {
  return request.postForm<IPermissionAllEntity[]>('rest/functionController?getUserFunctions', {
    functionType,
    wipeUrlIsNull,
  })
}

/**
 * # 获取部门人员树
 */
export function getNowTopOrgUserTrees() {
  return request.post<any>('/rest/userController.do?getNowTopOrgUserTrees')
}

/**
 * # 获取试验任务列表
 */
export function getTestTaskList(data: Record<string, any>) {
  const { isNeedAuth } = usePermissionStore()
  const apiUrl = isNeedAuth === IsNeedAuth.YES ? `rest/test/task/controller/datagrid` : `/api/indoor-screen/test/task/datagrid`

  const query = {
    type: '1',
    queryScope: 'user',
    dataType: '1',
    ...(isNeedAuth === IsNeedAuth.NO ? { noCertified: 1 } : false),
  }
  return request.get<any>(apiUrl, {
    params: {
      ...query,
      ...data,
    },
  })
}

export enum AuditTypeEnum {
  温湿度巡查台账审批 = 220,
  温湿度巡查异常处理 = 230,
};

export function getProcessUserTaskList(auditTypeId: AuditTypeEnum) {
  return request.get('rest/auditProcess/getProcessUserTaskList', {
    params: { auditTypeId },
  })
}

export function getStartFormData(auditTypeId: AuditTypeEnum) {
  return request.get('rest/auditProcess/getStartFormData', {
    params: { auditTypeId },
  })
}

/**
 * # 文件上传
 */
export function uploadFile(file: File) {
  return request.postForm<{ success: boolean, obj: any }>('/uploadController.do?upload', { file })
}
