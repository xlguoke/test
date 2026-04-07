import request from "@/utils/request.js"

/**
 * # 设备统计
 */
export function deviceStatistics(labId: string) {
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/statistics`,
    method: "get"
  })
}

/**
 * # 外出设备记录
 */
export function egressRecord(labId: string) {
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/egress/record`,
    method: "get"
  })
}

/**
 * # 各区域外出设备数量统计
 */
export function egressAddress(labId: string) {
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/egress/address`,
    method: "get"
  })
}

/**
 * # 归还超期设备展示
 */
export function egressOverdue(labId: string) {
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/egress/overdue`,
    method: "get"
  })
}

/**
 * # 期间核查到期、即将到期设备展示
 */
export function inspect(labId: string) {
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/inspect`,
    method: "get"
  })
}

/**
 * # 校检到期设备统计
 */
export function checkStatistics(labId: string) {
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/check/statistics`,
    method: "get"
  })
}

/**
 * # 校检到期、即将到期设备展示
 */
export function check(labId: string) {
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/check`,
    method: "get"
  })
}
