import { message } from 'ant-design-vue'
import { ILISHTTPError } from '~/types'

/**
 * # 上传
 */
export function upload(file: any) {
  return ilisAxios.postForm<any>(`rest/uploadController.do?upload`, {
    file,
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      message.error(err.message)
    }
    throw err
  })
}
