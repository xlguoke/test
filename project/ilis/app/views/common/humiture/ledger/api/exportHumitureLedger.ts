import { Modal } from 'ant-design-vue'
import { ILISHTTPError } from '~/types'

/** 导出台账 */
export function exportHumitureLedger(ids: string) {
  return ilisAxios.get<any>('rest/humiture/ledger?export', {
    params: { ids },
    responseType: 'blob',
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      Modal.error({
        title: '提示',
        content: err.message,
        centered: true,
        okText: '确定',
      })
    }
    throw err
  })
}
