import request from '~/providers/common/request'
// 获取编号
export function getEqumipt(params) {
  const body = {
    method: 'get',
    url: '/rest/consumablesController/generateConsumableSn',
  }
  if (params) {
    body.params = params
  }
  else {
    body.params = {
      generatedPlaceholderId: '',
    }
  }
  return request(body)
}
// 取消编号
export function cancelNumber(params) {
  return request({
    method: 'get',
    url: '/rest/snHistoryController/releaseSnByPlaceholder',
    params,
  })
}
