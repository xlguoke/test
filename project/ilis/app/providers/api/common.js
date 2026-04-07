import request from '~/providers/common/request'

export function printIds(data) {
  return request({
    method: 'post',
    url: 'rest/dictionaryController/putDataInServer',
    headers: {
      'content-type': 'application/json',
    },
    data,
  })
}
