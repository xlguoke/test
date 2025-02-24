// 从二维码路径中获取key
function getKeyByUrl(url: string) {
  if (!url)
    return ''
  const search = url.split('?')[1]
  const arr = search ? search.split('&') : []
  const key = arr.find(item => item.includes('key='))
  return key ? key.split('=')[1] : ''
}

// 获取主码
async function getQrCodeUrl(businessId: string, businessType: string, parentKey: string) {
  if (!businessType) {
    return Promise.reject(new Error('getQrCodeUrl：缺少businessType'))
  }
  try {
    const { data } = await ilisAxios.get(
      `/rest/attachmentQR/getQrCode/${businessType}?businessId=${businessId}&parentKey=${parentKey}`,
    )
    return data
  }
  catch (err) {
    return Promise.reject(err)
  }
}

// 获取二维码关联的附件
export async function getQrFileDatas(qrCodeKey: string, recursion = false) {
  if (!qrCodeKey) {
    return Promise.reject(new Error('缺少二维码key'))
  }
  try {
    const { data } = await ilisAxios.get(`/rest/attachmentQR/attachments/${qrCodeKey}`, {
      params: {
        recursion,
      },
    })
    return data.sort((p: any, n: any) => new Date(n.uploadTime).getTime() - new Date(p.uploadTime).getTime())
  }
  catch (err) {
    console.error('获取附件：', err)
    return []
  }
}

// 获取历史数据： 附件直接与业务关联，不存在二维码key，需要单独获取
export async function getHistoryFilesDatas(businessId: string, businessType: string) {
  if (!businessId)
    return []
  if (!businessType) {
    return Promise.reject(new Error('getHistoryFilesDatas：缺少businessType'))
  }
  try {
    const { data } = await ilisAxios.get(`/rest/attachmentQR/historical/attachments/${businessType}`, {
      params: {
        businessId,
      },
    })
    return data.sort((p: any, n: any) => new Date(n.uploadTime).getTime() - new Date(p.uploadTime).getTime())
  }
  catch (err) {
    console.error('获取历史附件异常：', err)
    return []
  }
}

// 初始化附件管理数据
export async function initFileDatas(
  {
    businessId = '',
    businessType = '',
    recursion = false,
    parentKey = '',
    dfQrCodeUrl = '',
    forceInit = false,
  },
) {
  try {
    const key = `${businessType}-${businessId}-qrCodeUrl`
    let qrCodeUrl = ''
    if (!window[key]) {
      if (!forceInit) {
        qrCodeUrl = dfQrCodeUrl || await getQrCodeUrl(businessId, businessType, parentKey)
        window[key] = qrCodeUrl
      }
      qrCodeUrl = dfQrCodeUrl || await getQrCodeUrl(businessId, businessType, parentKey)
    }
    else {
      qrCodeUrl = window[key]
    }
    const qrCodeKey = getKeyByUrl(qrCodeUrl)
    const historyfileDatas = await getHistoryFilesDatas(businessId, businessType)
    const fileDatas = await getQrFileDatas(qrCodeKey, recursion)

    return { qrCodeUrl, qrCodeKey, historyfileDatas, fileDatas: fileDatas.concat(historyfileDatas) }
  }
  catch (err) {
    return Promise.reject(err)
  }
}

// 删除历史附件
export async function deleteHistoryFile(file: any, businessType: string) {
  try {
    const { data } = await ilisAxios.delete(`/rest/attachmentQR/historical/attachments/${businessType}`, {
      params: {
        businessAttachmentId: file.businessAttachmentId,
      },
    })
    return data
  }
  catch (err) {
    console.error('删除历史附件err：', err)
    return Promise.reject(err)
  }
}

// 删除附件
export async function deleteQrFile(file: any, qrCodeKey: string, businessType: string) {
  try {
    if (file.historical) {
      // 历史附件
      return await deleteHistoryFile(file, businessType)
    }
    const { data } = await ilisAxios.delete(`/rest/attachmentQR/fileDel`, {
      params: {
        key: qrCodeKey,
        attachmentId: file.attachmentId,
      },
    })
    return data
  }
  catch (err) {
    return Promise.reject(err)
  }
}

// 下载附件
export async function downloadQrFile(file: any) {
  ilisAxios({
    url: file.url,
    method: 'get',
    responseType: 'blob',
  }).then(({ data: res }) => {
    const blob = new Blob([res])
    const elink = document.createElement('a')
    elink.download = file?.name
    elink.style.display = 'none'
    elink.href = window.URL.createObjectURL(blob)
    document.body.appendChild(elink)
    elink.click()
    document.body.removeChild(elink)
  })
}
