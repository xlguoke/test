import qs from 'qs'
import request from '~/providers/common/request'
// 获取层级
export function getLevel(data) {
  return request({
    url: '/bigCategoryController.do?datagrid',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    data: qs.stringify(data),
  })
}
// 查询允许引用的单位信息
export function allowedNnits() {
  return request({
    url: '/rest/big-category/reference/allowed-units',
    method: 'get',
  })
}
// 查询指定单位的大类信息
export function byunit(params) {
  return request({
    url: '/rest/big-category/reference/categories-by-unit',
    method: 'get',
    params,
  })
}
// 保存引用过来的大类信息
export function save(data) {
  return request({
    url: '/rest/big-category/reference/save',
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    data,
  })
}
