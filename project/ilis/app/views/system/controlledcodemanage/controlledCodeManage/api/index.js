import ajax from '~/providers/common/ajax'

// 获取受控码列表
async function getCodeList(params) {
  const res = await ajax.get('/rest/controlCode/list', {
    params,
  })

  return res
}

// 新增受控码
async function addCode(data) {
  const res = await ajax.post('/rest/controlCode', JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
    },
  })
  return res
}

// 编辑受控码
async function editCode(data) {
  const res = await ajax.put('/rest/controlCode', JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
    },
  })
  return res
}

// 删除受控码
async function deleteCode(id) {
  const res = await ajax.delete(`/rest/controlCode/${id}`)
  return res
}

// 检查受控码是否存在
async function checkCodeExist(params) {
  const res = await ajax.get('/rest/controlCode/codeExist', {
    params,
  })
  return res
}

// 受控码导出
async function codeExport(categoryId) {
  const exportUrl = `/ilis2/rest/controlCode/export?categoryId=${categoryId}`
  window.open(exportUrl)
}

// 受控码导入
async function codeImport(data) {
  const res = await ajax.post('/rest/controlCode/import', data)
  return res
}

// 获取受控码变更记录
async function getCodeChangeRecord(params) {
  const res = await ajax.get('/rest/controlCode/version', {
    params,
  })

  return res
}

// 获取检测大类下拉列表数据
async function getBigCategoryList(id) {
  const res = await ajax.get('/bigCategoryController.do?getById', {
    params: { id },
  })
  return res
}

// 添加获取udr sheet进行中状态
// 此方法改为在udr页面调用，vue页面不进行调用
async function addStatus(messageId) {
  const res = await ajax.get('/rest/controlCode/addStatus', {
    params: { messageId },
  })
  return res
}

// 获取udr sheet进行中状态
async function getStatus(messageId) {
  const res = await ajax.get('/rest/controlCode/getStatus', {
    params: { messageId },
  })
  return res
}

// 同步数据中心受控码
async function syncCenterCode(categoryId) {
  const formData = new FormData()
  formData.append('categoryId', categoryId)
  const res = await ajax.post('/rest/controlCode/syncCenterCode', formData)
  return res
}

export {
  addCode,
  addStatus,
  checkCodeExist,
  codeExport,
  codeImport,
  deleteCode,
  editCode,
  getBigCategoryList,
  getCodeChangeRecord,
  getCodeList,
  getStatus,
  syncCenterCode,
}
