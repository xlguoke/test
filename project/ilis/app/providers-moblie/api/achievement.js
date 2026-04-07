import request from '../common/request'

export function addAchievement(data) {
  return request({
    method: 'post',
    url: 'rest/synthesis/achievement',
    data,
  })
}

export function updateAchievement(data) {
  return request({
    method: 'put',
    url: 'rest/synthesis/achievement',
    data,
  })
}
