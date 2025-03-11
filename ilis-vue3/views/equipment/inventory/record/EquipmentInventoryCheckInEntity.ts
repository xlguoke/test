import { EquipmentAssetEntity } from '../../asset/EquipmentAssetEntity'
import { TableField } from '~/anyThing/decorator/TableField'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { FormField } from '~/anyThing/decorator/FormField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 设备盘点状态
 */
export enum EquipmentInventoryCheckInStatus {
/** # 待盘点 */
  WAIT = '10',
  /** # 正常 */
  NORMAL = '20',
  /** # 盘点异常 */
  EXCEPTION = '30',
  /** # 位置异常 */
  LOCATION_EXCEPTION = '40',
}

/**
 * # 设备盘点状态字典
 */
export const EquipmentInventoryCheckInStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentInventoryCheckInStatus.WAIT, label: '待盘点' },
  { key: EquipmentInventoryCheckInStatus.NORMAL, label: '正常' },
  { key: EquipmentInventoryCheckInStatus.EXCEPTION, label: '盘点异常' },
  { key: EquipmentInventoryCheckInStatus.LOCATION_EXCEPTION, label: '位置异常' },
])

/**
 * # 设备盘点entity
 */
export class EquipmentInventoryCheckInEntity extends EquipmentAssetEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('所属部门')
  departmentId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入设备编号/资产编号',
  })
  @SearchField({
    width: '360px',
  })
  @CustomField('快捷查询')
  queryCode?: string

  @TableField({
    width: 100,
  })
  @CustomField('使用状态', 'eqAssetsStatus')
  useStatus?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @SearchField()
  @TableField({
    fixed: 'right',
    width: 100,
  })
  @CustomField('盘点状态', EquipmentInventoryCheckInStatusDict)
  declare status?: EquipmentInventoryCheckInStatus

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请选择',
  })
  @TableField({
    fixed: 'right',
    width: 100,
  })
  @CustomField('盘点人')
  inventoryUserName?: string

  inventoryUserId?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    fixed: 'right',
    width: 180,
  })
  @CustomField('盘点时间')
  inventoryTime?: string

  @FormField()
  @TableField({
    fixed: 'right',
    width: 100,
  })
  @CustomField('备注')
  remark?: string

  @TableField({
    fixed: 'right',
    width: 100,
  })
  @CustomField('操作')
  declare operation?: any
}
