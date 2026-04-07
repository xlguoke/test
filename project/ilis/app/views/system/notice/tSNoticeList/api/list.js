import qs from 'qs'
import ajax from '~/providers/common/ajax'
// 列表
export function getlist(data) {
  return ajax({
    url: '/noticeController.do?datagrid2&field=id,noticeTitle,noticeType,noticeLevel,mustRead,noticeTerm,',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    method: 'POST',
    data: qs.stringify(data),
  })
}
// 批量删除数据
export function deleteData(data) {
  return ajax({
    url: '/rest/noticeController/del',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  })
}
// 获取角色
export function datagridRole() {
  return ajax({
    url: '/userController.do?datagridRole&field=id,roleName,',
    method: 'POST',
  })
}
// 获取用户
export function userName(data) {
  return ajax({
    url: '/userController.do?datagrid&field=id,userName,realName',
    method: 'POST',
    data: qs.stringify(data),
  })
}
// noticeController.do?doAdd
// 发布公告
export function doAdd(data) {
  return ajax({
    url: '/rest/noticeController/save',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  })
}
// 根据id查询内容
export function getdetail(id) {
  return ajax({
    url: `/rest/noticeController/${id}`,
    method: 'get',
  })
}
// 修改
export function doUpdate(data) {
  return ajax({
    url: `/noticeController.do?doUpdate`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    data: qs.stringify(data),
  })
}
