import ajax from '~/providers/common/ajax'
import request from '~/providers/common/request'

export function getEquipmentUseRecord(query) {
  return request({
    method: 'get',
    url: 'rest/equipment/useRecord',
    params: query,
  })
}

export function getDepartment() {
  return ajax({
    method: 'post',
    url: 'orgController.do?getOrgComboTree',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
}

/**
 * 获取功能室
 */
export function getLaboratoryApi() {
  return request({
    method: 'get',
    url: 'rest/laboratoryController?datagridAll',
  })
}

// 导出
export function exportUseRecord(params) {
  return ajax({
    url: 'rest/equipment/use-record-export',
    method: 'get',
    responseType: 'blob',
    params,
  })
}
