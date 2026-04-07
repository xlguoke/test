import request from './ajax'

// 获取列表
export function getList(params) {
  return request({
    url: '/rest/eq/devices',
    method: 'get',
    params,
  })
}
// 获取设备名称
export function getDevice() {
  return request({
    url: 'equipmentNewController.do?datagrid&page=1&rows=10000&quickQryParam=&onlyIotEquipment=true',
    method: 'get',
  })
}
// 新增设备装置
export function add(data) {
  return request({
    url: '/rest/eq/devices',
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    data,
  })
}
// 编辑设备装置
export function putData(data) {
  return request({
    url: '/rest/eq/devices',
    method: 'put',
    headers: {
      'Content-type': 'application/json',
    },
    data,
  })
}
// 删除设备装置
export function deleteData(data) {
  return request({
    url: `/rest/eq/devices/${data}`,
    method: 'delete',
  })
}
// 根据ID获取智能装置
export function getByIdData(data) {
  return request({
    url: `/rest/eq/devices/${data}`,
    method: 'get',
  })
}
// 设置智能装置的启用状态
export function getByIdActivity(data) {
  return request({
    url: `/rest/eq/devices/${data}/activity`,
    method: 'patch',
  })
}
// 下载导入模板
export function deviceXls() {
  return request({
    url: `/rest/eq/devices/智能装置导入模板.xlsx`,
    method: 'get',
    responseType: 'blob',
  })
}
// 更新墨水屏标签
export function updateLabel(deviceId) {
  return request({
    url: `/rest/eq/update/label?devicesId=${deviceId}`,
    method: 'get',
  })
}
