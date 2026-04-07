import type { SignOrderConfigEntity } from './SignOrderConfigEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * # 获取签名配置列表
 */
export function getSignOrderConfigList() {
  return IlisApiHelper.get<SignOrderConfigEntity[]>('rest/signOrderConfig/list')
}

/**
 * # 获取签名尺寸（px）
 */
export function getSignSizePX() {
  return IlisApiHelper.get<{ signWidth: number, signHigh: number }>('rest/signer/sign/wh/px')
}
