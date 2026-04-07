import { IlisApiHelper } from '~/utils/IlisApiHelper'

export async function edit(data: Record<string, any>) {
  return IlisApiHelper.put('rest/auditAuthorityController/update', data)
}

// 获取所有功能室
export async function getAllFunctionRoom(params: any) {
  return IlisApiHelper.get('rest/laboratoryController?dataGridPage', params)
}

// 获取人员功能室权限配置
export async function getFunctionRoomAuthorityByUserId(userId: string) {
  return IlisApiHelper.get(`rest/laboratory-authority/${userId}`)
}
// 保存人员功能室权限配置
export async function saveFunctionRoomAuthority(userId: string, laboratoryIdList: string[]) {
  return IlisApiHelper.post(`rest/laboratory-authority/${userId}`, { laboratoryIdList })
}
