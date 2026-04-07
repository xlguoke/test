import request from "@/utils/request.js"
import { formatDate } from "@/utils/utils"
import * as CryptoJS from "crypto-js"

/**
 * 查询功能室信息
 * @param id 功能室id
 * @returns
 */
export function getRoomInfo(id: string) {
  return request({
    url: `/api/laboratory-big-screen/info/${id}`,
    method: "get"
  })
}

/**
 * 查询功能室设备
 * @param id
 * @returns
 */
export function getDeviceList(id: string) {
  return request({
    url: `/api/laboratory-big-screen/eqs/${id}`,
    method: "get"
  })
}

/**
 * 查询设备正在进行的任务
 * @param id
 * @returns
 */
export function getDeviceTask(id: string) {
  return request({
    url: `/api/laboratory-big-screen/eq/testing-task/${id}`,
    method: "get"
  })
}

/**
 * 查询设备的维修信息（最后一次
 * @param id
 * @returns
 */
export function getDeviceMaintance(id: string) {
  return request({
    url: `/api/laboratory-big-screen/eq/repair/${id}`,
    method: "get"
  })
}

/**
 * 查询待检任务列表
 * @param id
 * @returns
 */
export function getDeviceTaskTodo(id: string) {
  return request({
    url: `/api/laboratory-big-screen/tasks/${id}`,
    method: "get"
  })
}

export function getQdmToken() {
  const timeStamp = parseInt((Date.now() / 1000).toString())
  const stringToHash = "system" + "ht" + timeStamp
  const token = CryptoJS.MD5(stringToHash).toString(CryptoJS.enc.Hex)
  return request({
    url: `https://htzl.qdm123.com/SSOLogin/CheckLogin?ssoName=system&date=${timeStamp}&token=${token}`,
    method: "post"
  })
}
/**
 * 获取人员进出记录
 * @param id
 * @returns
 */
export function getInOutRecord(id: string, token: string) {
  // 开始时间 当天00:00:00
  const date = formatDate(new Date(), 0)
  return request({
    url: `https://htzl.qdm123.com/api/vue/v1/Attendance/GetDoorEventList?SerialNumber=${id}&MaxOrderIndex=868&StartDate=${date} 00:00:00&EndDate=${date} 23:59:59`,
    method: "get",
    headers: {
      ssoToken: token
    }
  })
}

export function getInOutRecordMonth(id: string, token: string) {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()
  // 开始时间 当月1号 00:00:00
  const startOfMonth = formatDate(new Date(year, month, 1))
  // 结束时间 当月最后一天 23:59:59
  const endOfMonth = formatDate(new Date(year, month + 1, 0))
  return request({
    url: `https://htzl.qdm123.com/api/vue/v1/Attendance/GetDoorEventList?SerialNumber=${id}&MaxOrderIndex=868&StartDate=${startOfMonth} 00:00:00&EndDate=${endOfMonth} 23:59:59`,
    method: "get",
    headers: {
      ssoToken: token
    }
  })
}
