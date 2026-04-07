import request from '~/providers/common/request'

export function deleteAttachment(id) {
  return request({
    method: 'delete',
    url: `rest/synthesis/attachment/${id}`,
  })
}

export function addAttachment(data) {
  return request({
    method: 'post',
    url: 'rest/synthesis/attachment',
    data,
  })
}

export function updateAttachment(data) {
  return request({
    method: 'put',
    url: 'rest/synthesis/attachment',
    data,
  })
}

export function getAttachmentList(type, id, query) {
  return request({
    method: 'get',
    url: `rest/synthesis/attachment/${type}/${id}`,
    params: query,
  })
}

export function getAttachmentQueryList(query) {
  return request({
    method: 'get',
    url: 'rest/synthesis/attachment/list',
    params: query,
  })
}
