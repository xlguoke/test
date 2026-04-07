import request from '~/providers/common/request'
// 查询列表
export function getList(params) {
  return request({
    method: 'get',
    url: '/rest/consumable/query/inventory',
    params,
  })
}
// 导出
export function exportFile(params) {
  return request({
    method: 'get',
    url: '/rest/consumable/query/inventory/export',
    params,
    responseType: 'blob',
  })
}
