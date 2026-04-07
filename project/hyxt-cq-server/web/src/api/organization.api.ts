import axios from "@/config/http.config"
import { queryParType, QueryAdmListType, AdmInfoType } from "@/type/api/organization.api"

//  导出
export function exportExcelAPI(params: queryParType) {
  return axios({
    url: "/org/export",
    method: "get",
    responseType: "blob",
    params
  })
}

//  获取分页列表
export function getPageList(params: queryParType) {
  return axios({
    url: "/org",
    method: "get",
    params
  })
}

// 根据类型获取行管、机构（不分页）
// type: adm-行管，org-机构
export function getPageListByType(type = "org") {
  return axios({
    url: `/org/by-type/${type}`,
    method: "get"
  })
}

// 获取详情
export function getDetail(id: string) {
  return axios({
    url: "/org/" + id,
    method: "get"
  })
}

// 申请注销
interface LogoutType {
  orgId: string
  auditAdmId: string
}
export function logout(data: LogoutType) {
  const { orgId, auditAdmId } = data
  return axios({
    url: `/org/${orgId}/logout?auditAdmId=${auditAdmId}`,
    method: "get"
  })
}

// 禁止
export function logoutMandatory(id: string) {
  return axios({
    url: `/org/${id}/logout/mandatory`,
    method: "get"
  })
}

// 启用
export function restore(id: string) {
  return axios({
    url: `/org/${id}/restore`,
    method: "get"
  })
}

// // 获取机构关联的行业管理单位
// export function findAdmByOrg(orgId: string) {
//   return axios({
//     url: `/org/adm/findAdmByOrg/${orgId}`,
//     method: "get"
//   })
// }

interface syncType {
  orgId?: string
  types?: string[] // ORG-机构，PERSON-人员，CERT-证书，QUALIFY-资质，EQ_QUALIFY_PARSON-资质-人员对应表，EQ_QUALIFY_PARAM-参数，EQUIPMENT-设备
}
// 同步数据
export function syncDatas(data: syncType) {
  return axios({
    url: "/sync",
    method: "post",
    data
  })
}

// // 行管列表
// export function getAdmList(params: QueryAdmListType) {
//   return axios({
//     url: "/org/adm",
//     method: "get",
//     params
//   })
// }

// 获取单位列表
export function getBureausListAPI(params: QueryAdmListType) {
  return axios({
    url: "/bureaus?pagination",
    method: "get",
    params
  })
}

// // 行管详情
// export function getAdmDetail(admId: string) {
//   return axios({
//     url: `/org/adm/${admId}`,
//     method: "get"
//   })
// }

// 行管详情（新）
export function getAdmDetail(admId: string) {
  return axios({
    url: `/bureaus/${admId}`,
    method: "get"
  })
}

// //  新增行管机构
// export function addAdm(data: AdmInfoType) {
//   return axios({
//     url: "/org/adm/add",
//     method: "post",
//     data
//   })
// }
//  新增行管机构 （新）
export function addAdm(data: AdmInfoType) {
  return axios({
    url: "/bureaus",
    method: "post",
    data
  })
}

// //  编辑行管机构
// export function editAdm(data: AdmInfoType) {
//   return axios({
//     url: "/org/adm/modify",
//     method: "post",
//     data
//   })
// }
//  编辑行管机构（新）
export function editAdm(data: AdmInfoType) {
  return axios({
    url: "/bureaus",
    method: "put",
    data
  })
}

// // 删除行管
// export function delAdm(admId: string) {
//   return axios({
//     url: `/org/adm/${admId}`,
//     method: "delete"
//   })
// }

// 删除行管（新）
export function delAdm(admId: string) {
  return axios({
    url: `/bureaus/${admId}`,
    method: "delete"
  })
}

// 同步行管人员
export function asyncAdmUserInfo() {
  return axios({
    url: "/idaas/user/sync",
    method: "get"
  })
}
// //  查询行管管理的机构
// export function getAdmOrgRelations(id: string) {
//   return axios({
//     url: `/org/adm/admOrgRelations/${id}`,
//     method: "get"
//   })
// }
//  查询行管管理的机构(新)
export function getAdmOrgRelations(id: string) {
  return axios({
    url: `/bureaus/agencies?id=${id}`,
    method: "get"
  })
}

// //  设置行管管理的机构
// export function saveAdmOrgRelations(data: AdmRelationType[]) {
//   return axios({
//     url: "/org/adm/admOrgRelations/save",
//     method: "post",
//     data
//   })
// }

//  设置行管管理的机构（新）
export function saveAdmOrgRelations(data) {
  return axios({
    url: "/bureaus/agencies",
    method: "post",
    data
  })
}

// 获取建设单位分页列表
export function getConstructorsList(params: Object): Promise<any> {
  return axios({
    url: "/constructors?pagination",
    method: "get",
    params
  })
}

//获取建设单位详情
export function getConstructorsDetails(id): Promise<any> {
  return axios({
    url: `/constructors/${id}`,
    method: "get"
  })
}

//  新增建设单位
export function addConstructors(data: Object): Promise<any> {
  return axios({
    url: "/constructors",
    method: "post",
    data
  })
}
//同步建设单位
export function syncConstructors(): Promise<any> {
  return axios({
    url: "/constructors/synchronization",
    method: "get"
  })
}

//  编辑建设单位
export function editConstructors(data: Object): Promise<any> {
  return axios({
    url: "/constructors",
    method: "put",
    data
  })
}
// 删除建设单位
export function delConstructors(id: string) {
  return axios({
    url: `/constructors/${id}`,
    method: "delete"
  })
}
