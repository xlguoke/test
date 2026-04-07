import ajax from '~/providers/common/ajax'

// 获取发票列表
async function getInvoiceList(params) {
  const res = await ajax.get('/rest/invoices', {
    params,
  })

  return res
}

// 发票登记
async function addInvoice(data) {
  const res = await ajax.post('/rest/invoice', JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
    },
  })
  return res
}

// 获取发票详情
async function getInvoiceDetail(id) {
  const res = await ajax.get(`/rest/invoice/${id}`)
  return res
}

// 编辑发票
async function editInvoice(data) {
  const res = await ajax.put('/rest/invoice', JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
    },
  })
  return res
}

// 更换发票
async function replaceInvoice(data) {
  const res = await ajax.post('/rest/invoice/replacement', JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
    },
  })
  return res
}

// 删除发票
async function deleteInvoice(id) {
  const res = await ajax.delete(`/rest/invoice/${id}`)
  return res
}

// 废弃发票
async function abandonInvoice(id) {
  const res = await ajax.put(`/rest/invoice/deprecation/${id}`)
  return res
}

// 检测当前输入编号是否重复
async function checkCodeIsRepeat(params) {
  const res = await ajax.get('/rest/invoice/snd', {
    params,
  })

  return res
}

// 选择费用列表
async function getFeeList(params) {
  const res = await ajax.get('/rest/invoice/bills', {
    params,
  })

  return res
}

// 自动匹配费用
async function autoMatchingFee(params) {
  const res = await ajax.get('/rest/invoice/matched-bills', {
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
async function invoiceIssuance(data) {
  const res = await ajax.post('/rest/invoice/issuance', data)
  return res
}

// 撤销发放
async function revocationIssuance(params) {
  const res = await ajax.delete('/rest/invoice/issuance', {
    params,
  })
  return res
}

export {
  abandonInvoice,
  addInvoice,
  autoMatchingFee,
  checkCodeIsRepeat,
  deleteInvoice,
  editInvoice,
  exportStandingBook,
  getFeeList,
  getInvoiceDetail,
  getInvoiceList,
  invoiceIssuance,
  replaceInvoice,
  revocationIssuance,
}
