import { Modal } from 'ant-design-vue'
import { ILISHTTPError } from '~/types'
import type { HumitureRecordListParams } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'

/** 导出台账 */
export function exportHumitureRecord(params?: HumitureRecordListParams) {
  return ilisAxios.get<any>('rest/humiture/record?export', {
    params,
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
