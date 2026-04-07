/// <reference types="cordova-plugin-device" />
import { readLogFileBuffer } from 'custodian'
import { request } from '@/axios'
import { formatDate } from '@/utils'
import { useReportErrorStore } from '@/stores/reportError'

export function useReportedError() {
  function reportedError(err: any) {
    if (err && err.message === 'reportedError')
      return
    const store = useReportErrorStore()
    store.showDialog(err)
  }

  async function reportedFetch(err: any, errDescribe: string) {
    try {
      const errFile = await readLogFileBuffer()
      const res = await request({
        url: '/ilis2/rest/upload/error/log',
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: {
          description: errDescribe,
          imei: device.uuid,
          type: err.name || 'UnknownError',
          errorTimeStr: formatDate(new Date(), 2),
          file: errFile,
        },
      })
      return res
    }
    catch (err: any) {
      // 日志上报异常
      return Promise.reject(err)
    }
  }

  return {
    reportedError,
    reportedFetch,
  }
}
