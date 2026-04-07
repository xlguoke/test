import axios from "@/config/http.config"

export interface DataItemType {
  id?: string
  idNum: string //证件编号
  trainItem: string //培训项目
  trainLocation: string //培训地点
  trainTime: string | number //培训时间
  trainTimeEnd: string | number
  annual: string | number //年度
  hours: string //学时
  remark: string //备注
  orgPersonName: string //机构人员名称
  orgPersonId: string //机构人员ID
  orgId: string //人员所属机构ID
}

export interface ListQueryType {
  current: number | undefined
  size: number | undefined
  annual?: string
  q?: string
}

// 列表
export function pageListApi(params: ListQueryType) {
  return axios({
    url: "further/education/page",
    method: "get",
    params
  })
}
// 详情
export function detailApi(id: string) {
  return axios({
    url: `further/education/${id}`,
    method: "get"
  })
}
export function checkidentityInformationApi(params) {
  return axios({
    url: `org/person/check`,
    method: "get",
    params
  })
}
// 新增
export function addApi(data: DataItemType) {
  return axios({
    url: "further/education",
    method: "post",
    data
  })
}
// 编辑
export function editApi(data: DataItemType) {
  return axios({
    url: "further/education",
    method: "put",
    data
  })
}
// 删除
export function deleteApi(id: string) {
  return axios({
    url: `further/education/${id}`,
    method: "delete"
  })
}
// 导入

export function importApi(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return axios({
    url: `further/education/import`,
    method: "post",
    data: formData
  })
}

//导入二次确认
export function secondaryConfirmationApi(params) {
  return axios({
    url: `further/education/import?tempFile=${params.tempFile}`,
    method: "post"
  })
}
