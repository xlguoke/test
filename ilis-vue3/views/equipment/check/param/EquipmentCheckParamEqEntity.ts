import { DeviceEntity } from '../../DeviceEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 设备检校状态枚举
 */
export enum EquipmentCheckStatus {
  /** # 正常 */
  NORMAL = '1',
  /** # 即将到期 */
  SOON_EXPIRED = '2',
  /** # 已到期 */
  EXPIRED = '3',
}

/**
 * # 设备检校状态字典
 */
export const EquipmentCheckStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentCheckStatus.NORMAL, label: '正常', color: '#70b603' },
  { key: EquipmentCheckStatus.SOON_EXPIRED, label: '即将到期', color: '#f59a23' },
  { key: EquipmentCheckStatus.EXPIRED, label: '已到期', color: '#d9001b' },
])

/**
 * # 检校参数设备entity
 */
export class EquipmentCheckParamEqEntity extends DeviceEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('检校项目/参数')
  checkItemName?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('检校项目/参数')
  checkItemCount?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField({
    isAlways: true,
  })
  @CustomField('检校状态', EquipmentCheckStatusDict)
  checkItemStatus?: EquipmentCheckStatus

  @TableField()
  @CustomField('所属功能室')
  declare laboratoryName?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  declare operation: any
}
