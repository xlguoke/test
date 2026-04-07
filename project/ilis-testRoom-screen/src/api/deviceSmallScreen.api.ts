import request from "@/utils/request.js"

/**
 * 查询屏绑定的设备列表
 * @param ids
 * @returns
 */
export function getDeviceList(ids: string) {
  // return request({
  //   url: `/api/eq-screen/eqs?equipmentIds=${ids}`,
  //   method: "get"
  // })
  return request.post("/api/eq-screen/eqs/with-status-desc", ids?.split(","))
}

/**
 * 查询屏绑定的设备列表（不带状态描述）
 * @param ids
 * @returns
 */
export function getDeviceListWithoutDesc(ids: string) {
  return request.post("/api/eq-screen/eqs", ids?.split(","))
}

/**
 * 查询设备详细信息
 * @param id
 * @returns
 */
export function getDeviceInfo(id: string) {
  return request({
    url: `/api/eq-screen/eq/${id}`,
    method: "get"
  })
}

/**
 * 查询设备参数信息
 * @param id
 * @returns
 */
export function getDeviceParam(id: string) {
  return request({
    url: `/api/eq-screen/eq-test-param/${id}`,
    method: "get"
  })
}

/**
 * 查询设备操作指南
 * @param id
 * @returns
 */
export function getDeviceManual(id: string) {
  return request({
    url: `/api/eq-screen/eq-manual/${id}`,
    method: "get"
  })
}

/**
 * 查询设备保养指南
 * @param id
 * @returns
 */
export function getDeviceKeepManual(id: string) {
  return request({
    url: `/api/eq-screen/eq-upkeep/${id}`,
    method: "get"
  })
}

/**
 * 查询设备检校证书信息
 * @param id
 * @returns
 */
export function getDeviceCertification(id: string) {
  return request({
    url: `/api/eq-screen/eq-certification/${id}`,
    method: "get"
  })
}

/**
 * 查询设备检校证书信息
 * @param query
 * @returns
 */
export function getDeviceRecord(query: { equipmentId?: string; q?: string; stamp?: string }) {
  const queryStr = new URLSearchParams(query)
  return request({
    url: `/api/eq-screen/eq-use-record?${queryStr}`,
    method: "get"
  })
}

/**
 * # 查询单位信息
 */
export function getUnitInfo() {
  return request({
    url: `/api/profileController/unit/infos`,
    method: "get"
  })
}

/**
 * # 期间核查详情
 */
export function getPeriodCheckDetail(equipmentId: string) {
  return request({
    url: `/api/eq-screen/eq-inspect/${equipmentId}`,
    method: "get"
  })
}
