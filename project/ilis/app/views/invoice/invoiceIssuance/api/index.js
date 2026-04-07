import ajax from '~/providers/common/ajax'

// 获取发票发放列表
async function getList(params) {
  const res = await ajax.get('/rest/invoices', {
    params,
  })

  return res
}

// 导出台账
async function exportStandingBook(params) {
  const keys = Object.keys(params)
  let exportUrl = `/ilis2/rest/invoice-excel`
  // eslint-disable-next-line array-callback-return
  keys.map((key, index) => {
    exportUrl += `${index == 0 ? '?' : '&'}${key}=${params[key]}`
  })
  window.open(exportUrl)
}

// 发票发放
async function addIssuance(data) {
  const res = await ajax.post('/rest/invoice/issuance', JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
    },
  })
  return res
}

// 撤销发票发放
async function revokeIssuance(id) {
  const res = await ajax.delete(`/rest/invoice/issuance/${id}`)
  return res
}

// 根据发票获取发票明细中委托所选邮寄信息获取接口
async function getMailByConsign(invoiceId) {
  const res = await ajax.get(`/rest/post/infos`, {
    params: {
      invoiceId,
    },
  })
  return res
}

export {
  addIssuance,
  exportStandingBook,
  getList,
  getMailByConsign,
  revokeIssuance,
}
