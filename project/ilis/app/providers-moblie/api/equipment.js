import ajax from '../common/ajax'
import request from '../common/request'

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
