import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { EquipmentRentEntity } from '~/views/equipment/rent/EquipmentRentEntity'

/**
 * # 获取设备租借信息（无需登录）
 */
export function getEquipmentRentDetailWithouAuth(unitCode: string, id: string) {
  return IlisApiHelper.get<EquipmentRentEntity>(`rest/eq/rent/signer/${unitCode}/${id}`)
}
