import request from '~/providers/common/request'

export function getReport(params) {
  return request({
    url: `/rest/report/security-code-affix/quantity`,
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    data: params,
  })
}
