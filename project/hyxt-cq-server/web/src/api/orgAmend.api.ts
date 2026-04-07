import axios from "@/config/http.config"
import {
  AddAuditAttachments,
  BaseListParam,
  ListParam,
  SaveParam,
  AuditParam
} from "@/type/api/orgAmend.api"

/** 获取分页列表 */
export function pageListApi(params: ListParam) {
  return axios({
    url: "/org/amend/pagination",
    method: "get",
    params
  })
}

/** 新增机构信息变更 */
export function addApi(data: SaveParam) {
  return axios({
    url: "/org/amend/create",
    method: "post",
    data
  })
}

/** 修改机构信息变更 */
export function updateApi(data: SaveParam) {
  return axios({
    url: "/org/amend/update",
    method: "put",
    data
  })
}

/** 删除机构信息变更 */
export function deleteApi(orgAmendId: string) {
  return axios({
    url: `/org/amend/${orgAmendId}`,
    method: "delete"
  })
}

/** 提交机构信息变更 */
export function submitApi(orgAmendId: string) {
  return axios({
    url: `/org/amend/submit/${orgAmendId}`,
    method: "get"
  })
}

/** 机构信息变更详情 */
export function detailApi(id: string) {
  return axios({
    url: `/org/amend/${id}`,
    method: "get"
  })
}

/** 导出分页查询结果 */
export function exportApi(params: ListParam) {
  return axios({
    url: "/org/amend/pagination/export",
    method: "get",
    responseType: "blob",
    params
  })
}

/** 获取机构分页查询数据 */
export function amendOrgListApi(params: BaseListParam) {
  return axios({
    url: "/org/amend/org-pagination",
    method: "get",
    params
  })
}

/** 获取待选的变更内容 */
export function pendingAmendContentApi() {
  return axios({
    url: "/org/amend/pending-amend-content",
    method: "get"
  })
}

/** 获取机构信息变更审核附件信息 */
export function auditAttachmentsApi(orgAmendId: string) {
  return axios({
    url: `/org/amend/audit/extend/${orgAmendId}`,
    method: "get"
  })
}

/** 添加机构信息变更审核附件信息 */
export function addAuditAttachmentsApi(orgAmendId: string, data: AddAuditAttachments[]) {
  return axios({
    url: `/org/amend/audit/extend/${orgAmendId}`,
    method: "post",
    data
  })
}

/** 办结 */
export function auditExecution(data: AuditParam) {
  return axios({
    url: "/org/amend/audit/execution",
    method: "post",
    data
  })
}
