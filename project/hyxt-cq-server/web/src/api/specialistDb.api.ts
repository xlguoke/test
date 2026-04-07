import axios from "@/config/http.config"
import {
  queryParType,
  dataItemType,
  actQueryParType,
  actDataItemType,
  recordParType,
  checkType,
  evaluationType
} from "@/type/api/specialistDb.api"

/*------专家列表-----------------------------------*/
//  获取分页列表
export function getPageList(params: queryParType) {
  let parStr = ""
  for (let k in params) {
    if (!params[k]) continue
    if (k === "water" || k === "highway") {
      const arr = params[k] || []
      if (arr.length == 0) continue
      for (let i = 0; i < arr.length; i++) {
        parStr += `${k}=${arr[i]}&`
      }
    } else {
      parStr += `${k}=${params[k]}&`
    }
  }
  return axios({
    url: "/expert?" + parStr,
    method: "get"
  })
}

// 获取详情
export function detailApi(id: string) {
  return axios({
    url: "/expert/" + id,
    method: "get"
  })
}

// 选择记录
export function selectRecordList(params) {
  return axios({
    url: "/repert/",
    method: "get",
    params
  })
}

// 新增-编辑
export function saveApi(data: dataItemType) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/expert",
    method: type,
    data
  })
}

// 删除
export function delById(id: string) {
  return axios({
    url: "/expert/" + id,
    method: "delete"
  })
}
// 恢复
export function restoreApi(id: string) {
  return axios({
    url: "/expert/restore/" + id,
    method: "get"
  })
}

// 导入
export function importApi(data, key?: string) {
  key = key ? key : "excel"
  return axios({
    url: `/expert/import/${key}`,
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
}

/* ----活动列表-------------------------------- */
//  获取分页列表
export function actPageList(params: actQueryParType) {
  return axios({
    url: "/activity",
    method: "get",
    params
  })
}

// 获取详情
export function actDetailApi(id: string) {
  return axios({
    url: "/activity/" + id,
    method: "get"
  })
}

// 新增-编辑
export function actSaveApi(data: actDataItemType) {
  const type = data.id ? "put" : "post"
  return axios({
    url: "/activity",
    method: type,
    data
  })
}

// 删除
export function actDelById(id: string) {
  return axios({
    url: "/activity/" + id,
    method: "delete"
  })
}
// 活动记录
// @param  expertId 专家id
export function actRecordApi(expertId: string) {
  return axios({
    url: `/activity/record/${expertId}`,
    method: "get"
  })
}
// 专家抽取
export function actExtractingApi(data: recordParType) {
  return axios({
    url: "/activity/extracting",
    method: "post",
    data
  })
}
// 专家列表 - 添加活动时手动选择的专家列表
export function actSpecialist(data: recordParType) {
  return axios({
    url: `/activity/manually/add`,
    method: "post",
    data
  })
}
// 专家活动时间检查 - 检查手动添加的专家活动时间是否与其他活动有冲突
export function actCheck(params: checkType) {
  return axios({
    url: `/activity/check`,
    method: "get",
    params
  })
}

// 当前活动专家评价

export function actEvaluation(data: evaluationType[]) {
  return axios({
    url: `/activity/evaluation`,
    method: "put",
    data
  })
}
