import type { InviteFileData } from '..'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

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
export async function getQrFileDatas(qrCodeKey: string, recursion = false, orderBy?: string, order?: string) {
  if (!qrCodeKey) {
    return Promise.reject(new Error('缺少二维码key'))
  }
  try {
    const { data } = await ilisAxios.get(`/rest/attachmentQR/attachments/${qrCodeKey}`, {
      params: {
        recursion,
        orderBy,
        order,
      },
    })
    // 如果有排序参数，使用接口返回的顺序；否则按上传时间降序排序
    if (!orderBy) {
      return data.sort((p: any, n: any) => new Date(n.uploadTime).getTime() - new Date(p.uploadTime).getTime())
    }
    return data
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
    orderBy = '',
    order = '',
  },
) {
  try {
    let qrCodeUrl = dfQrCodeUrl
    if (forceInit || !dfQrCodeUrl) {
      qrCodeUrl = await getQrCodeUrl(businessId, businessType, parentKey)
    }
    const qrCodeKey = getKeyByUrl(qrCodeUrl)
    const historyfileDatas = await getHistoryFilesDatas(businessId, businessType)
    const fileDatas = await getQrFileDatas(qrCodeKey, recursion, orderBy, order)
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

/** 设置邀请二维码 */
export interface IniteParam {
  /** 主码 */
  coreKey?: string
  /** 邀请码 */
  key?: string
  /** 分享对象 */
  audience: string
  /** 过期日期 */
  invalidTime: string
}
export async function setInviteQrCode(params: IniteParam) {
  try {
    const { data } = await ilisAxios.post<string>('/rest/attachmentQR/shareQrCode', params)
    return data
  }
  catch (err) {
    message.error((err as Error).message || '设置失败')
    return Promise.reject(err)
  }
}

/** 编辑邀请二维码 */
export async function editInviteQrCode(params: IniteParam) {
  try {
    const { data } = await ilisAxios.put<string>('/rest/attachmentQR/modifyShareQr', params)
    return data
  }
  catch (err) {
    message.error((err as Error).message || '保存失败')
    return Promise.reject(err)
  }
}

/** 邀请管理数据列表 */
export async function getInviteList(coreKey: string) {
  try {
    const { data } = await ilisAxios.get<InviteFileData[]>(`/rest/attachmentQR/shareCodeList?key=${coreKey}`)
    data.forEach((item) => {
      item.invalidTime = item.invalidTime ? dayjs(item.invalidTime).format('YYYY-MM-DD') : ''
    })
    return data
  }
  catch (err) {
    console.error(err)
    return []
  }
}

/**
 * 禁用邀请码
 */
export async function disableInviteQrCode(key: string) {
  try {
    const { data } = await ilisAxios.delete<string>(`/rest/attachmentQR/${key}`)
    return data
  }
  catch (err) {
    message.error((err as Error).message || '禁用失败')
    return Promise.reject(err)
  }
}

/**
 * 恢复邀请码
 */
export async function recoverInviteQrCode(key: string) {
  try {
    const { data } = await ilisAxios.get<string>(`/rest/attachmentQR/recover/${key}`)
    return data
  }
  catch (err) {
    message.error((err as Error).message || '恢复失败')
    return Promise.reject(err)
  }
}
