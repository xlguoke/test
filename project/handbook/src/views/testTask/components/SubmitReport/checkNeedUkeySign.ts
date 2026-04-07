import { request } from '@/axios'

// 检查提交是否需要ukey签字
export async function checkNeedUkeySign(): Promise<boolean> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const loading = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    const res = await request({
      url: '/ilis2/rest/signer/sign-service',
      method: 'get',
    }).finally(loading.close) as any

    if (res.signatureServer === 'usbKeySign') {
      reject(new Error('无法提交！'))
      showDialog({
        title: '提示',
        message: '当前电子签名为Ukey模式，移动端无法完成电子签名，请前往PC端提交报告！',
      })
      return
    }

    resolve(true)
  })
}
