import ajax from '~/providers/common/ajax'

// 获取列表
async function getUserList(data) {
  const res = await ajax.post('/rest/userCountersign/list', data)
  return res
}

// 新增用户
async function addUser(data) {
  const res = await ajax.post('/rest/userCountersign/addUser', data)
  return res
}

// 修改备注
async function updateMark(data) {
  const res = await ajax.post('/rest/userCountersign/updateMark', data)
  return res
}

// 删除人员
async function delUser(ids) {
  const res = await ajax.get('/rest/userCountersign/delUser', {
    params: {
      ids,
    },
  })
  return res
}

export { addUser, delUser, getUserList, updateMark }
