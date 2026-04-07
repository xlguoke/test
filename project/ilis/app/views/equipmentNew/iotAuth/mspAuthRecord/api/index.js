import request from '~/providers/common/request'
// 获取数据
export function getlist(params) {
  return request({
    method: 'get',
    url: '/rest/eq/device/update/record/list',
    params,
  })
}
