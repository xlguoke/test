import axios from "@/config/http.config"
import {
  equipmentCapacityEditParms,
  getGradesParms,
  getTestProjectParms,
  getEquipmentsParms,
  ListQueryParams,
  equipmentCapacityAddParms,
  EditStaffCharactersConfig
} from "@/type/api/earlyWarn.api"

//  获取专业类型
export function getSpecialtyTypeAPI(): Promise<any> {
  return axios({
    url: "/alarms/specialities",
    method: "get"
  })
}

//  获取版本号
export function getVersionAPI(): Promise<any> {
  return axios({
    url: "/alarms/versions",
    method: "get"
  })
}
//  获取等级
export function getGradesAPI(params: getGradesParms): Promise<any> {
  return axios({
    url: "/alarms/grades",
    method: "get",
    params
  })
}
//  获取试验项目
export function getTestProjectAPI(params: getTestProjectParms): Promise<any> {
  return axios({
    url: "/alarms/items",
    method: "get",
    params
  })
}
//  获取标准设备
export function getEquipmentsAPI(params: getEquipmentsParms): Promise<any> {
  return axios({
    url: "/alarms/equipments",
    method: "get",
    params
  })
}

//新增设备量能设置
export function addEquipmentCapacityAPI(params: equipmentCapacityAddParms): Promise<any> {
  return axios({
    url: "/alarms/equipment-capacity",
    method: "post",
    data: params
  })
}
//编辑设备量能设置
export function editEquipmentCapacityAPI(params: equipmentCapacityEditParms): Promise<any> {
  return axios({
    url: "/alarms/equipment-capacity",
    method: "PUT",
    data: params
  })
}

//获取设备量能设置列表
export function getEquipmentCtListAPI(params: ListQueryParams): Promise<any> {
  return axios({
    url: "/alarms/equipment-capacities",
    method: "get",
    params
  })
}

//删除设备量能设置
export function deleteEquipmentCtAPI(id): Promise<any> {
  return axios({
    url: `/alarms/equipment-capacity/${id}`,
    method: "DELETE"
  })
}

//获取人员角色类型
export function getStaffCharactersAPI(): Promise<any> {
  return axios({
    url: "/alarms/staff-characters",
    method: "get"
  })
}

//新增人员量能设置
export function addStaffEarlyWarnConfigAPI(params: EditStaffCharactersConfig): Promise<any> {
  return axios({
    url: "/alarms/staff-capacity",
    method: "post",
    data: params
  })
}
//编辑人员量能设置
export function editStaffEarlyWarnConfigAPI(params: EditStaffCharactersConfig): Promise<any> {
  return axios({
    url: "/alarms/staff-capacity",
    method: "put",
    data: params
  })
}

//获取人员量能设置列表
export function getStaffEarlyWarnListAPI(params: ListQueryParams): Promise<any> {
  return axios({
    url: "/alarms/staff-capacities",
    method: "get",
    params
  })
}

//删除设备量能设置
export function deleteStaffEarlyWarnAPI(id): Promise<any> {
  return axios({
    url: `/alarms/staff-capacity/${id}`,
    method: "DELETE"
  })
}

//获取设备量能示警列表
export function getEquipmentWarnListAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis/equipments",
    method: "get",
    params
  })
}
//获取采集量能示警列表
export function getGatherListAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis/collects",
    method: "get",
    params
  })
}
//获取人员量能示警列表
export function getStaffsWarnListAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis/staffs",
    method: "get",
    params
  })
}

//设备分析量能示警
export function getEquipmentAnalysisAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis/EQUIPMENT",
    method: "get",
    params
  })
}
//采集分析量能示警
export function getGatherAnalysisAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis/COLLECT",
    method: "get",
    params
  })
}
//人员分析量能示警
export function getStaffAnalysisAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis/STAFF",
    method: "get",
    params
  })
}

//新增示警处理
export function addEarlyWarningProcessAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis/scheme",
    method: "post",
    data: params
  })
}

//获取处理方案
export function getEarlyWarningProcessAPI(id): Promise<any> {
  return axios({
    url: `/alarms/analysis/scheme/${id}`,
    method: "get"
  })
}

//删除示警
export function deleteEarlyWarningAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis",
    method: "DELETE",
    data: params
  })
}
//退回示警
export function rollbackEarlyWarningAPI(params): Promise<any> {
  return axios({
    url: "/alarms/analysis/status/REJECTED",
    method: "put",
    data: params
  })
}
