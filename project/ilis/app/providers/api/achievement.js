import request from '~/providers/common/request'

export function getFormData(data) {
  return request({
    method: 'get',
    url: '/rest/auditProcess/getStartFormData?auditTypeId=40',
    headers: {
      'content-type': 'application/json',
    },
    data,
  })
}
export function getProcessUser(data) {
  return request({
    method: 'get',
    url: '/rest/auditProcess/getProcessUserTaskList?auditTypeId=40',
    headers: {
      'content-type': 'application/json',
    },
    data,
  })
}
export function addAchievement(data) {
  return request({
    method: 'post',
    url: 'rest/synthesis/achievement',
    headers: {
      'content-type': 'application/json',
    },
    data,
  })
}

export function updateAchievement(data) {
  return request({
    method: 'put',
    url: 'rest/synthesis/achievement',
    headers: {
      'content-type': 'application/json',
    },
    data,
  })
}
