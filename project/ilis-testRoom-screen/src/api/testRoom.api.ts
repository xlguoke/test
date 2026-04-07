import request from "@/utils/request.js"

// 通过功能室id获取试验数据
export function getLaboratorInfo(laboratoryScreenId: string) {
  return request({
    url: `/rest/laboratoryScreenController/info?laboratoryScreenId=${laboratoryScreenId}`,
    method: "get"
  })
}
// 通过设备编号获取功能室信息
export function getLabInfoByScreenNum(displayScreenNum: string) {
  return request({
    url: `/rest/laboratoryScreenController/findByScreenNum?displayScreenNum=${displayScreenNum}`,
    method: "get"
  })
}

// 获取委托单位信息
export function getConsignUnitInfo() {
  return request({
    url: `/api/smart-screen/config/unit/info`,
    method: "get"
  })
}

// 获取试验任务
interface TaskQueryType {
  keyword?: string
  page: number
  size: number
}
export function getTestTask(params: TaskQueryType) {
  return request({
    url: "/rest/laboratoryScreenController/task",
    method: "get",
    params
  })
}

// 开始试验
interface StartTestType {
  laboratoryScreenId: string
  testTaskId: string
  testTaskParamIds: string
}
export function startLabTest(data: StartTestType) {
  return request({
    url: "/rest/laboratoryScreenController/start",
    method: "post",
    data
  })
}

// 结束试验
interface EndTestType {
  laboratoryScreenId: string
}
export function endLabTest(data: EndTestType) {
  return request({
    url: "/rest/laboratoryScreenController/end",
    method: "post",
    data
  })
}

// 获取单位信息
export function getWebConfigs(params) {
  return request({
    url: "/rest/profileController/getWebConfigs",
    method: "get",
    params
  })
}
interface DeviceInfo {
  page: number
  size: number
  queryParam?: string
  laboratoryScreenId: string
}
// 获取设备信息
export function getDeviceInfo(params: DeviceInfo) {
  return request({
    url: "/rest/laboratoryScreenController/eq/info",
    method: "get",
    params
  })
}

export function getChemicalList(params: {
  page: number
  size: number
  quickQry?: string
  laboratoryScreenId: string
}) {
  return request({
    url: "/api/chemical-room-screen/inventory",
    method: "get",
    params
  })
}

interface CustomTabPar {
  laboratoryScreenId: string
}

/**
 * 获取自定义屏
 * */
export function getCustomLabScreen(params: CustomTabPar) {
  return request({
    url: "/rest/laboratoryScreenController/custom",
    method: "get",
    params
  })
}

interface CustomTabInfoPar {
  customScreenId: string
}
// 获取自定义屏显示内容
export function getCustomLabScreenCInfo(params: CustomTabInfoPar) {
  return request({
    url: "/rest/laboratoryScreenController/custom/info",
    method: "get",
    params
  })
}

// 获取智慧屏配置
export function getSmartScreenConfig() {
  return request({
    url: "/api/smart-screen/config/pager",
    method: "get",
    params: {
      page: 1,
      size: 9999,
      companyId: localStorage.getItem("unitCode")
    }
  })
}
