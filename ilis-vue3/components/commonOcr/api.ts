import { message } from 'ant-design-vue'
import type { IOcrQueryParams } from './ocrResultMockData'
import { ILISHTTPError } from '~/types'

/**
 * # 查询OCR原始解析结果
 */
export function checkOcr(query: IOcrQueryParams, loading?: Ref<boolean>) {
  return ilisAxios.get<any>(`rest/ocr/result/${query.businessType}/${query.businessId}`).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
      if (loading) {
        loading.value = false
      }
    }
    throw err
  })
}
