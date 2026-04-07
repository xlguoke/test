import axios from "@/config/http.config"

import { checkPendingQuery, handleApprovalParams } from "@/type/api/infoCheck.api"

// 获取试验室备案,撤销模板文件
export function getModelFileBlobAPI(type: string, labId: string) {
  return axios({
    url: `/lab/attachment/template/${type}/${labId}`,
    responseType: "blob",
    method: "get"
  })
}
// 获取试验室变更模板文件
export function getModelFileAlterBlobAPI(type: string, alterId: string) {
  return axios({
    url: `/lab/amend/attachment/template/${type}/${alterId}`,
    responseType: "blob",
    method: "get"
  })
}
// 获取撤销申请附件模板文件
export function getModelFileBlobForRevokeAPI(type: string, labId: string) {
  return axios({
    url: `/lab/attachment/audit/${type}/${labId}`,
    method: "get"
  })
}

//  获取待审批列表
export function getCheckPendingListAPI(params: checkPendingQuery) {
  return axios({
    url: "/act/assignments",
    method: "get",
    params
  })
}
// 获取已审批列表
export function getCheckFinishListAPI(params: checkPendingQuery) {
  return axios({
    url: "/act/historic-assignments",
    method: "get",
    params
  })
}

// 添加试验室审核扩展信息
export function laboratoryAuditExtends(data: handleApprovalParams) {
  return axios({
    url: "laboratory/audit/extend",
    method: "post",
    data
  })
}
//检查备案通知书编号
export function chackCodeAPI(v: string) {
  return axios({
    url: `/laboratory/check-repetitive?number=${v}`,
    method: "get"
  })
}

//  审批接口
export function handleApprovalAPI(params: handleApprovalParams) {
  let id = params.taskId
  delete params.taskId
  return axios({
    url: `/act/assignment/${id}`,
    method: "put",
    data: params
  })
}

//账号注销申请详情
export function getAccountLogoutInfoAPI(id: string) {
  return axios({
    url: `/org/logout-info/${id}`,
    method: "get"
  })
}
//账号注册申请详情
export function getAccountRegInfoAPI(id: string) {
  return axios({
    url: `/org/reg-info/${id}`,
    method: "get"
  })
}

//检测业绩新增详情和变更详情
export function getAchievementInfoAPI(id: string) {
  return axios({
    url: `/achievement/test/achievement-info/${id}`,
    method: "get"
  })
}

//试验室业绩变更详情
export function getLaboratoryAchievementInfoAPI(id: string) {
  return axios({
    url: `/achievement/laboratory/achievement-info/${id}`,
    method: "get"
  })
}

//工地试验室变更详情
export function getLabChangeInfoAPI(id: string) {
  return axios({
    url: `/labAmend/${id}`,
    method: "get"
  })
}

//获取 备案、撤销 的申请附件
export function getAuditoAttachmentAPI(labid: string) {
  return axios({
    url: `/lab/attachment/audit/attachment/${labid}`,
    method: "get"
  })
}

//获取实验室审核分类——工地试验室or现场检测
export function getAuditoClassifyAPI(type: string, id: string) {
  return axios({
    url: `/laboratory/classification/${type}/${id}`,
    method: "get"
  })
}

//获取变更审核申请附件
export function getAlterAttachmentAPI(alterId: string) {
  return axios({
    url: `/lab/amend/attachment/audit/${alterId}`,
    method: "get"
  })
}

//不通过状态发送短信通知
export function sendMessageAPI(taskId: string): Promise<any> {
  return axios({
    url: `/act/assignment/notification/${taskId}`,
    method: "post"
  })
}

//机构重新注册审核 创建账号
export function orgCreateAccountAPI(id: string): Promise<any> {
  return axios({
    url: `/org/re-init-org/${id}`,
    method: "post"
  })
}
