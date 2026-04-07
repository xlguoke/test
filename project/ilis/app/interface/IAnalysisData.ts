import type { CertConfirmEntity } from '~/views/equipment/check/confirmList/CertConfirmEntity'
import type { EquipmentCheckConfirmEntity } from '~/views/equipment/check/confirmList/EquipmentCheckConfirmEntity'
import type { DeviceEntity } from '~/views/equipment/DeviceEntity'

/**
 * # AI解析填充数据接口
 */
export interface IAnalysisData {
  /** # 文件id */
  attachmentId: string
  /** # 设备信息 */
  deviceInfo: DeviceEntity
  /** # 证书信息 */
  certInfo: EquipmentCheckConfirmEntity
  /** # 检测结果信息 */
  certConfirmInfo: CertConfirmEntity[]
}
