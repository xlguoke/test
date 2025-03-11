import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取签名二维码链接
 */
export function getQrcodeLink() {
  return IlisApiHelper.get('/rest/eq/rent/signer/link')
}
