import axios from "@/config/http.config"
import {
  commitmentQueryType,
  queryParType,
  dataItemType,
  testDataItemType
} from "@/type/api/performance.api"

/* ------ 申报承诺书 ---------------------------------- */
// 分页查询承诺书
export function commitmentPageList(params: commitmentQueryType) {
  return axios({
    url: "/achievement/commitment",
    method: "get",
    params
  })
}
// 获取业绩申报承诺书
export function commitmentDetail(id: string) {
  return axios({
    url: `/achievement/commitment/${id}`,
    method: "get"
  })
}
// 上传承诺书
interface uploadType {
  url: string
  orgId: string
}
export function commitmentUpload(data: uploadType) {
  return axios({
    url: "/achievement/commitment",
    method: "post",
    data
  })
}
// 更新业绩申报承诺书
export function commitmentUpdate(data: uploadType) {
  return axios({
    url: "/achievement/commitment",
    method: "put",
    data
  })
}
// 检查机构是否上传了承诺书
export function checkApi(orgId: string) {
  return axios({
    url: "/achievement/commitment/check?orgId=" + orgId,
    method: "get"
  })
}

/* ------ 试验室业绩列表 ------------------------------- */
//  获取分页列表
export function getPageList(params: queryParType) {
  return axios({
    url: "/achievement/laboratory",
    method: "get",
    params
  })
}

// 新增/编辑试验室业绩（市外）
export function saveApi(data: dataItemType) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/achievement/laboratory",
    method: type,
    data
  })
}

// 强制变更
export function forceEditApi(data: dataItemType) {
  return axios({
    url: "/achievement/laboratory/mandatory",
    method: "put",
    data
  })
}

// 详情
export function detailApi(id: string) {
  return axios({
    url: `/achievement/laboratory/${id}`,
    method: "get"
  })
}

// 删除
export function deleteApi(id: string) {
  return axios({
    url: `/achievement/laboratory/${id}`,
    method: "delete"
  })
}

// 发布
export function publishApi(id: string) {
  return axios({
    url: `/achievement/laboratory/publish/${id}`,
    method: "get"
  })
}

// 恢复
export function restoreApi(id: string) {
  return axios({
    url: `/achievement/laboratory/restore/${id}`,
    method: "get"
  })
}
// 注销
export function logoutApi(id: string) {
  return axios({
    url: `/achievement/laboratory/logout/${id}`,
    method: "get"
  })
}

// 试验项目
export function getTestProject(majors: string) {
  return axios({
    url: `/achievement/item/${majors}`,
    method: "get"
  })
}

/* ----- 检测业绩列表 ------------------------- */
//  获取分页列表
export function testPageList(params: queryParType) {
  return axios({
    url: "/achievement/test",
    method: "get",
    params
  })
}
//  新增、编辑、变更
export function testSaveApi(data: testDataItemType) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/achievement/test",
    method: type,
    data
  })
}

// 强制变更
export function testForceEditApi(data: testDataItemType) {
  return axios({
    url: "/achievement/test/mandatory",
    method: "put",
    data
  })
}

//  详情
export function testDetailApi(id: string) {
  return axios({
    url: "/achievement/test/" + id,
    method: "get"
  })
}
//  删除
export function testDelApi(id: string) {
  return axios({
    url: "/achievement/test/" + id,
    method: "delete"
  })
}
// 发布
export function testPublishApi(id: string) {
  return axios({
    url: "/achievement/test/publish/" + id,
    method: "get"
  })
}
// 注销
export function testLogoutApi(id: string) {
  return axios({
    url: "/achievement/test/logout/" + id,
    method: "get"
  })
}
// 恢复
export function testRestoreApi(id: string) {
  return axios({
    url: "/achievement/test/restore/" + id,
    method: "get"
  })
}
//  同步
export function achievementSync() {
  return axios({
    url: "/achievement/test/sync",
    method: "get"
  })
}
