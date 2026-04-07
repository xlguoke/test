import request from '../common/ajax'

// 入库管理 - 分页列表
export function storageInPageList(params) {
  return request({
    method: 'get',
    url: '/rest/chemical/inventory/in/pagination',
    params,
  })
}

// 入库管理 - 详情
export function storageInDetail(id) {
  return request({
    method: 'get',
    url: `/rest/chemical/inventory/in/${id}`,
  })
}

// 入库管理 - 删除
export function storageInDelete(id) {
  return request({
    method: 'delete',
    url: `/rest/chemical/inventory/in/${id}`,
  })
}
// 入库管理 - 导出
export function storageInExport(params) {
  return request({
    method: 'get',
    responseType: 'blob',
    url: `/rest/chemical/inventory/in/export`,
    params,
  })
}
// 入库管理 - 下载模板
export function downloadExcelTemplate() {
  return request({
    method: 'get',
    responseType: 'blob',
    url: `/rest/chemical/inventory/in/downloadExcelTemplate`,
  })
}
// 入库管理 - 采购保存（未入库）
export function storageInSave(data) {
  return request({
    method: 'post',
    url: `/rest/chemical/inventory/in/save`,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    data,
  })
}
// 入库管理 - 采购入库
export function storageInPutaway(id) {
  return request({
    method: 'get',
    url: `/rest/chemical/inventory/in/putaway/${id}`,
  })
}
// 入库管理 - 采购导入
export function storageInImport(data) {
  const formData = new FormData()
  for (const k in data) {
    formData.append(k, data[k])
  }
  return request({
    method: 'post',
    url: `/rest/chemical/inventory/in/purchase/import`,
    data: formData,
  })
}

// 级别管理 - 获取所有级别
export function getLevelAll() {
  return request({
    method: 'get',
    url: `/rest/chemical/level/all`,
  })
}

// 化学品类管理 - 验证编号是否重复
export function snRepeat(params) {
  return request({
    method: 'get',
    url: `/rest/chemical/category/snRepeat`,
    params,
  })
}
