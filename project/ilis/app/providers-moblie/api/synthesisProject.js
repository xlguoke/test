import ajax from '../common/ajax'

export function deleteProject(id) {
  return ajax({
    method: 'post',
    url: 'projectController.do?doDel',
    params: { id },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
}
