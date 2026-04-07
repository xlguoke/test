import qs from 'qs'
import ajax from '~/providers/common/ajax'
// 获取列表
export function getList(data) {
  return ajax({
    url: '/noticeController.do?datagrid&field=id,isRead,noticeTitle,createTime,',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    method: 'post',
    data: qs.stringify(data),
  })
}
// 批量标记已读未读
export function noticeControllermarkRead(data) {
  return ajax({
    url: 'rest/noticeController/markRead',
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    data,
  })
}
//
export function updateNoticeRead(data) {
  return ajax({
    url: `noticeController.do?readNotice&noticeId=${data}`,
    method: 'get',
  })
}
