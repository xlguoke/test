import axios from "@/config/http.config"
import type {
  LaboratoryEditBaseParams,
  LaboratoryQueryParams,
  LaboratoryEditPersonParams,
  EditLabEquipmentParams,
  LaboratoryChangesBaseParams
} from "@/type/api/fieldLaboratory.api"

// 获取模板文件
export function getModelFileBlob(type: string, labId: string) {
  return axios({
    url: `/lab/template/${type}/${labId}`,
    responseType: "blob",
    method: "get"
  })
}
/*
 *
 * 工程项目管理api  start
 *
 *
 *
 */
//获取拥有审核权限账号的项目监督机构
export function getSupervisoryAuditAPI(params): Promise<any> {
  return axios({
    url: `/bureaus?withAuditPrivileged`,
    method: "get",
    params
  })
}
//获取工程项目监督机构
export function getSuperviseBureausAPI(params): Promise<any> {
  return axios({
    url: `/bureaus`,
    method: "get",
    params
  })
}

//同步公路工程项目
export function syncProjectAPI(): Promise<any> {
  return axios({
    url: `/projects/synchronization`,
    method: "get"
  })
}

//新增项目
export function addProjectAPI(params): Promise<any> {
  return axios({
    url: "/projects",
    method: "post",
    data: params
  })
}
//更新项目
export function updateProjectAPI(params): Promise<any> {
  return axios({
    url: "/projects",
    method: "put",
    data: params
  })
}

//获取项目详情
export function getProjectDetailsAPI(id): Promise<any> {
  return axios({
    url: `/projects/${id}`,
    method: "get"
  })
}

//获取项目
export function getProjectAPI(params): Promise<any> {
  return axios({
    url: `/projects?pagination`,
    method: "get",
    params: params
  })
}

//获取前期和在建状态的工程项目
export function getStateProjectAPI(params): Promise<any> {
  return axios({
    url: `/projects?paginationSelect`,
    method: "get",
    params: params
  })
}

//删除工程项目
export function deleteProjectAPI(id): Promise<any> {
  return axios({
    url: `/projects/${id}`,
    method: "DELETE"
  })
}

// 用户管理的工地试验室对应的工程项目列表
export function getUserProjectAPI(): Promise<any> {
  return axios({
    url: `/project/user/list`,
    method: "get"
  })
}
//关闭项目
export function closeProjectAPI(id: string): Promise<any> {
  return axios({
    url: `/project/shutdown/${id}`,
    method: "get"
  })
}
//开启项目
export function unlockProjectAPI(id: string): Promise<any> {
  return axios({
    url: `/project/startup/${id}`,
    method: "get"
  })
}

interface mergeProjectType {
  removedProjectId: string[]
  project: any
}
//合并项目
export function mergeProjectAPI(params: mergeProjectType): Promise<any> {
  return axios({
    url: "/project/merge",
    method: "post",
    data: params
  })
}

/*
 *
 *
 *
 *
 * 工地试验室相关api
 *
 *
 *
 *
 */

//获取试验室所有状态用于列表查询
export function getLabStatusAPI(): Promise<any> {
  return axios({
    url: `/laboratory/status`,
    method: "get"
  })
}

//获取试验室审核扩展信息
export function getLaboratoryExtendAPI(labId: any): Promise<any> {
  return axios({
    url: `/laboratory/audit/extend/${labId}`,
    method: "get"
  })
}

//新增/编辑试验室内容时，判断是否允许切换到其他标签页
export function checkTabAPI(params: any): Promise<any> {
  let { labId, flow, targetFlow } = params
  return axios({
    url: `/laboratory/integrity/${labId}/${flow}/${targetFlow}`,
    method: "get"
  })
}

//新增工地试验室基本信息
export function addLaboratoryAPI(params: LaboratoryEditBaseParams): Promise<any> {
  return axios({
    responseType: "text", //设置响应值类型
    url: "/laboratory/add",
    method: "post",
    data: params
  })
}

/**
 * 新增试验室审核提交
 * @param id
 * @param applyType(String) KEEP:备案  AMEND:变更  DELAY:延期  REVOKE:撤销
 */
export function submitLabAuditAPI(param: any): Promise<any> {
  return axios({
    url: `/laboratory/submitAudit`,
    method: "post",
    data: param
  })
}
//删除工地试验室
export function deleteLaboratoryAPI(id: string): Promise<any> {
  return axios({
    url: `/laboratory/${id}`,
    method: "delete"
  })
}
/**
 * 试验室变更 延期申请
 * @param id
 * @param applyType(String) AMEND:变更  DELAY:延期  REVOKE:撤销
 */
export function labApplyAPI(id: string, applyType: string): Promise<any> {
  return axios({
    url: `/laboratory-apply/${id}/${applyType}`,
    method: "get"
  })
}

/**
 * 试验室取消操作
 * @param id
 * @param applyType(String) AMEND:变更  DELAY:延期  REVOKE:撤销
 */
export function cancelLabAuditAPI(id: string, applyType: string): Promise<any> {
  return axios({
    url: `/laboratory/cancel/${id}/${applyType}`,
    method: "get"
  })
}

//试验室撤销和恢复
export function clearUndoAPI(id): Promise<any> {
  return axios({
    url: `/laboratory/statusSwitchover/${id}`,
    method: "get"
  })
}

//修改工地试验室基本信息
export function editLaboratoryAPI(params: LaboratoryEditBaseParams): Promise<any> {
  return axios({
    url: `/laboratory/update`,
    method: "post",
    data: params
  })
}

//工地试验室基本信息变更申请
export function changesLaboratoryAPI(params: LaboratoryChangesBaseParams): Promise<any> {
  return axios({
    url: "/labAmend/new",
    method: "post",
    data: params
  })
}

/*
 *
 *
 *
 *
 * 工地试验室 人员修改api
 *
 *
 *
 *
 */

//查询工地试验室人员信息
export function getLabPersonAPI(id: string): Promise<any> {
  return axios({
    url: `/laboratoryPerson/lab/${id}`,
    method: "get"
  })
}

// 新增实验室授权负责人
export function addLabPrincipalPersonAPI(params: LaboratoryEditPersonParams): Promise<any> {
  return axios({
    url: `/laboratoryPerson/add/principal`,
    method: "post",
    data: params
  })
}

// 新增工地试验室持证人员
export function addLaboratoryPaersonAPI(params: Array<LaboratoryEditPersonParams>): Promise<any> {
  return axios({
    url: `/laboratoryPerson/add`,
    method: "post",
    data: params
  })
}
// 移除工地试验室持证人员
export function removeLaboratoryPaersonAPI(params: unknown): Promise<any> {
  return axios({
    url: `/laboratoryPerson/remove`,
    method: "post",
    data: params
  })
}

//新增实验室其他人员
export function addLaboratoryOtherPaersonAPI(params: unknown): Promise<any> {
  return axios({
    url: `/laboratoryPerson/add/off-staff`,
    method: "post",
    data: params
  })
}
// 移除实验室其他人员
// export function removeLaboratoryOtherPaersonAPI(id): Promise<any> {
//   return axios({
//     url: `/laboratoryPerson/delete/off-staff/${id}`,
//     method: "DELETE"
//   })
// }

/*
 *
 *
 *
 *
 * 工地试验室 设备修改api
 *
 *
 *
 *
 */

// 新增工地试验室设备
export function addLabEquipmentAPI(params: EditLabEquipmentParams): Promise<any> {
  return axios({
    url: `/labEquipment/add`,
    method: "post",
    data: params
  })
}
// 新增工地试验室设备导入
export function importLabEquipmentAPI(params: unknown): Promise<any> {
  return axios({
    url: `/labEquipment/import/equipment`,
    method: "post",
    data: params
  })
}

// 上传校准证书
export function importLabCalibrationCertAPI(params: unknown): Promise<any> {
  return axios({
    url: `/labEquipment/import/calibration_cert`,
    method: "post",
    data: params
  })
}
//检查导入设备检校证书文件名是否为设备编号
export function checkCalibrationCertAPI(params): Promise<any> {
  return axios({
    url: "/labEquipment/check/calibration_cert",
    method: "post",
    data: params
  })
}

//查询试验室设备列表
export function getLabEquipmentAPI(params: unknown): Promise<any> {
  return axios({
    url: `/labEquipment/pages`,
    method: "get",
    params: params
  })
}

//查询标准设备列表
export function getStandardEqAPI(): Promise<any> {
  return axios({
    url: `/equipment/standard`,
    method: "get"
  })
}

//查询试验室设备详细信息
export function getLabEquipmentInfoAPI(id: string, params: unknown): Promise<any> {
  return axios({
    url: `/labEquipment/${id}`,
    method: "get",
    params
  })
}
//编辑工地试验室设备
export function editLabEquipmentAPI(params: EditLabEquipmentParams): Promise<any> {
  return axios({
    url: `/labEquipment/modify`,
    method: "post",
    data: params
  })
}
//删除试验室设备
export function removeEquipmentAPI(id: string, laboratoryId: string): Promise<any> {
  return axios({
    url: `/labEquipment/${id}?labId=${laboratoryId}`,
    method: "delete"
  })
}
//查询试验室设备检校证书信息
export function getLabEquipmentCertificateAPI(id: string, labId?: string): Promise<any> {
  return axios({
    url: `/labEquipment/calibrationReport/${id}?labId=${labId}`,
    method: "get"
  })
}

//  导出excel
export function exportExcelAPI(params: LaboratoryQueryParams) {
  return axios({
    url: "/labs/export",
    method: "get",
    responseType: "blob",
    params
  })
}

//查询工地试验室列表
export function getLaboratoryAPI(params: LaboratoryQueryParams): Promise<any> {
  return axios({
    url: `/labs?pagination`,
    method: "get",
    params: params
  })
}
// export function getLaboratoryAPI(params: LaboratoryQueryParams): Promise<any> {
//   return axios({
//     url: `/laboratory/pages`,
//     method: "get",
//     params: params
//   })
// }
//查询当前用户已授权的工地试验室列表
export function getUserLaboratoryAPI(projectId?: string): Promise<any> {
  return axios({
    url: `/labs?user-labs&projectId=${projectId || ""}`,
    method: "get"
  })
}
// export function getUserLaboratoryAPI(projectId?: string): Promise<any> {
//   return axios({
//     url: `/laboratory/user/list?projectId=${projectId || ""}`,
//     method: "get"
//   })
// }

// 查询试验室基本信息
export function getLaboratoryInfoAPI(id: string): Promise<any> {
  return axios({
    url: `/laboratory/${id}`,
    method: "get"
  })
}
// 查询试验室人员信息
export function getLaboratoryPersonAPI(id: string): Promise<any> {
  return axios({
    url: `/laboratoryPerson/pages?current=1&size=9999&labId=${id}`,
    method: "get"
  })
}

/*
 *   试验室备案资料 api
 *
 */

// 试验室备案资料上传
export function archivalDataUploadAPI(params: Object): Promise<any> {
  return axios({
    url: `/lab/attachment/upload`,
    method: "post",
    data: params
  })
}

//查询资料详情
export function getArchivalDataDetailsAPI(params: any): Promise<any> {
  return axios({
    url: `/lab/attachment/detail/${params.type}/${params.labId}`,
    method: "get"
  })
}

//查询资料上传数量
export function getArchivalDataNumberAPI(params: any): Promise<any> {
  return axios({
    url: `/lab/attachment/${params.type}/${params.labId}`,
    method: "get"
  })
}

// 资料模板下载
export function downTemplateAPI(type, labId) {
  return axios({
    url: `/lab/attachment/template/${type}/${labId}`,
    method: "get",
    responseType: "blob"
  })
}

//文件批量打包下载
export function downloadFileZipAPI(type: String, labId: String) {
  return axios({
    url: `/lab/attachment/zip/${type}/${labId}`,
    method: "get",
    responseType: "blob"
  })
}

/*
 *   建设单位审批材料 api
 *
 */

// 建设单位审批材料上传
export function approveFileUploadAPI(params: Object): Promise<any> {
  return axios({
    url: "/laboratory/builder",
    method: "post",
    data: params
  })
}

/*
 *   检测业务范围api
 *
 */
//查询当前用户已授权的工地试验室列表
export function getBusinessScopeAPI(params: any): Promise<any> {
  return axios({
    url: `/laboratoryBusinessScope`,
    method: "get",
    params: params
  })
}

//添加检测业务范围
export function addBusinessScopeAPI(params: Object): Promise<any> {
  return axios({
    url: `/laboratoryBusinessScope`,
    method: "post",
    data: params
  })
}
//更新检测业务范围
export function updateBusinessScopeAPI(params: Object): Promise<any> {
  return axios({
    url: `/laboratoryBusinessScope`,
    method: "Put",
    data: params
  })
}
//删除检测业务范围
export function deleteBusinessScopeAPI(id: string, labId: string): Promise<any> {
  return axios({
    url: `/laboratoryBusinessScope/${id}?labId=${labId}`,
    method: "delete"
  })
}
// 检测业务范围模板导入
export function importBusinessScopeAPI(params: any): Promise<any> {
  return axios({
    url: `/laboratoryBusinessScope/import`,
    method: "post",
    data: params
  })
}
//查询检测业务范围信息详情
export function getBusinessScopeDetPI(id: string, labId: string): Promise<any> {
  return axios({
    url: `/laboratoryBusinessScope/detail?id=${id}&labId=${labId}`,
    method: "get"
  })
}

/*
 *   试验室授权业务范围api
 *
 *
 *
 *
 */

// 试验室授权业务查询
export function getLabBusinessScopeAPI(labId: string, params: unknown): Promise<any> {
  return axios({
    url: `/laboratory-auth-business-scope/list-tiling/${labId}`,
    method: "get",
    params: params
  })
}
// 获取资质数据
export function getLaboratoryQualifyAPI(labId): Promise<any> {
  return axios({
    url: `/laboratory-auth-business-scope/qualify/${labId}`,
    method: "get"
  })
}

//获取机构项目
export function getPojectTreeAPI(qualifyId): Promise<any> {
  return axios({
    url: `/laboratory-auth-business-scope/tree/${qualifyId}`,
    method: "get"
  })
}

//获取项目参数
export function getPojectParmsAPI(id: String, qaId: string, quick: String): Promise<any> {
  return axios({
    url: `/laboratory-auth-business-scope/item-param/${qaId}/${id}?quick=${quick}`,
    method: "get"
  })
}

//添加授权业务范围
export function addAuthBusinessAPI(params: any): Promise<any> {
  return axios({
    url: `/laboratory-auth-business-scope`,
    method: "post",
    data: params
  })
}
//更新授权业务范围
export function updateAuthBusinessAPI(params: any): Promise<any> {
  return axios({
    url: `/laboratory-auth-business-scope`,
    method: "put",
    data: params
  })
}

//移出授权业务范围
export function removePojectParmsAPI(id: String, labId: String): Promise<any> {
  return axios({
    url: `/laboratory-auth-business-scope/${id}?labId=${labId}`,
    method: "DELETE"
  })
}

/*
 *   试验室变更API
 *
 *
 *
 *
 */
//创建一条试验室变更申请,并返回变更申请id
export function createAlterAPI(labId, params): Promise<any> {
  return axios({
    url: `/lab/amend/apply/${labId}`,
    method: "post",
    responseType: "text", //设置响应值类型
    data: params
  })
}
//变更流程 完整性验证
export function alterIntegrityCheck(alterId: string, flow: number) {
  return axios({
    url: `/lab/amend/integrity/${alterId}/${flow}`,
    method: "get"
  })
}
// 根据变更申请id查询试验室变更前后基本数据
export function getAlterBaseInfo(alterId: string) {
  return axios({
    url: `/lab/amend/lab-info/${alterId}`,
    method: "get"
  })
}

//基本信息变更
export function baseInfoAlterAPI(alterId, params): Promise<any> {
  return axios({
    url: `/lab/amend/lab-info/${alterId}`,
    method: "put",
    data: params
  })
}

// 根据变更申请id查询试验室变更前后授权业务范围信息
export function getAlterBus(alterId: string) {
  return axios({
    url: `/lab/amend/auth-business/tiling/${alterId}`,
    method: "get"
  })
}

//变更-添加授权业务范围
export function addBusinessAlterAPI(alterId, params): Promise<any> {
  return axios({
    url: `/lab/amend/auth-business/${alterId}`,
    method: "post",
    data: params
  })
}
//变更 - 删除授权业务范围
export function deleteAlterBusinessAPI(alterId, id): Promise<any> {
  return axios({
    url: `/lab/amend/auth-business/${alterId}/${id}`,
    method: "DELETE"
  })
}
// 变更-编辑授权业务范围参数
export function updateAlterBusinessAPI(alterId, params): Promise<any> {
  return axios({
    url: `/lab/amend/auth-business/${alterId}`,
    method: "put",
    data: params
  })
}

// 根据变更申请id查询试验室变更前后人员信息
export function getAlterPersonAPI(alterId: string) {
  return axios({
    url: `/lab/amend/people/${alterId}`,
    method: "get"
  })
}
// 变更-新增工地试验室持证人员
export function addLabPaersonAlterAPI(
  alterId: string,
  params: Array<LaboratoryEditPersonParams>
): Promise<any> {
  return axios({
    url: `/lab/amend/people/staff/${alterId}`,
    method: "post",
    data: params
  })
}
// 变更-移除工地试验室持证人员
export function removeLabPaersonAlterAPI(
  params: unknown,
  alterId: string,
  id: string
): Promise<any> {
  return axios({
    url: `/lab/amend/people/remove/${alterId}/${id}`,
    method: "post",
    data: params
  })
}

// 变更 - 新增实验室授权负责人
export function addLabPrincipalPersonAlterAPI(
  alterId: string,
  params: LaboratoryEditPersonParams
): Promise<any> {
  return axios({
    url: `/lab/amend/people/principal/${alterId}`,
    method: "post",
    data: params
  })
}
// 变更 - 添加人员岗位信息
export function addLabPersonJobAlterAPI(alterId: string, params: Object): Promise<any> {
  return axios({
    url: `/lab/amend/people/position/${alterId}`,
    method: "post",
    data: params
  })
}
// 根据变更申请id查询试验室变更前后检测业务范围信息
export function getAlterCheckBusAPI(alterId: string, params) {
  return axios({
    url: `/lab/amend/test-business/pagination/${alterId}`,
    method: "get",
    params
  })
}

//变更-添加检测业务范围
export function addBusAlterAPI(alterId: string, params: Object): Promise<any> {
  return axios({
    url: `/lab/amend/test-business/${alterId}`,
    method: "post",
    data: params
  })
}
//变更-更新检测业务范围
export function updateBusAlterAPI(alterId: string, params: Object): Promise<any> {
  return axios({
    url: `/lab/amend/test-business/${alterId}`,
    method: "Put",
    data: params
  })
}
//变更-删除检测业务范围
export function deleteBusAlterAPI(alterId: string, id: string): Promise<any> {
  return axios({
    url: `/lab/amend/test-business/${alterId}/${id}`,
    method: "delete"
  })
}
//变更 - 查看检测业务详情
export function getBusDetAlterAPI(alterId: string, id: string) {
  return axios({
    url: `/lab/amend/test-business/detail/${alterId}/${id}`,
    method: "get"
  })
}
// 变更-检测业务范围模板导入
export function importBusAlterAPI(alterId: string, params: any): Promise<any> {
  return axios({
    url: `/lab/amend/test-business/import/${alterId}`,
    method: "post",
    data: params
  })
}

//变更- 证明资料模板下载
export function downTemplateAlterAPI(type, alterId) {
  return axios({
    url: `/lab/amend/attachment/template/${type}/${alterId}`,
    method: "get",
    responseType: "blob"
  })
}
// 变更- 证明资料附件提交
export function archivalDataUploadAlterAPI(alterId, params): Promise<any> {
  return axios({
    url: `/lab/amend/attachment/upload/${alterId}`,
    method: "post",
    data: params
  })
}

//变更- 查询资料上传数量
export function getArchivalDataNumberAlterAPI(alterId): Promise<any> {
  return axios({
    url: `/lab/amend/attachment/${alterId}`,
    method: "get"
  })
}

//变更-查询资料详情
export function getArchivalDataDetailsAlterAPI(type: string, alterId: string): Promise<any> {
  return axios({
    url: `/lab/amend/attachment/detail/${type}/${alterId}`,
    method: "get"
  })
}
//变更-变更记录详情
export function getRecordDetailsAlterAPI(alterId: string): Promise<any> {
  return axios({
    url: `/lab/amend/record/detail/${alterId}`,
    method: "get"
  })
}

//变更-变更记录日志
export function getRecordAlterLogsAPI(labId: string): Promise<any> {
  return axios({
    url: `/lab/amend/record/${labId}`,
    method: "get"
  })
}

//变更-变更记录日志
export function getAlterMaterialDetAPI(alterId: string): Promise<any> {
  return axios({
    url: `/lab/amend/record/detail/${alterId}`,
    method: "get"
  })
}

//通过试验室id获取变更申请id
export function alterIdGetLabIdAPI(labId: string): Promise<any> {
  return axios({
    responseType: "text", //设置响应值类型
    url: `/lab/amend/apply/last/${labId}`,
    method: "get"
  })
}
