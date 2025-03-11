import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import type { IDeviceEntity } from '~/interface/IDeviceEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 设备固定资产调拨状态枚举
 */
export enum EquipmentAssetAllotStatus {
  /** # 填写中 */
  WAIT_APPROVE = '10',
  /** # 审批中 */
  APPROVE_ING = '20',
  /** # 审批拒绝 */
  APPROVE_REJECT = '30',
  /** # 审批通过 */
  APPROVE_SUCCESS = '40',
  /** # 申请被驳回 */
  APPROVE_FAIL = '50',
}

/**
 * # 设备固定资产调拨状态字典
 */
export const EquipmentAssetAllotStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentAssetAllotStatus.WAIT_APPROVE, label: '填写中' },
  { key: EquipmentAssetAllotStatus.APPROVE_ING, label: '审批中' },
  { key: EquipmentAssetAllotStatus.APPROVE_REJECT, label: '审批拒绝' },
  { key: EquipmentAssetAllotStatus.APPROVE_SUCCESS, label: '审批通过' },
  { key: EquipmentAssetAllotStatus.APPROVE_FAIL, label: '申请被驳回' },
])

export class EquipmentAssetAllotEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入资产编号/设备编号/资产类型/设备名称',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQryParam?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('固定资产')
  equipmentName?: string

  equipmentId?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('调拨时间')
  /** 搜索用 */
  commonDate?: Date[]

  equipmentVo?: IDeviceEntity

  @TableField()
  @CustomField('资产编号')
  assetSn?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField()
  @TableField()
  @CustomField('资产类别', 'eqAssets')
  type?: string

  @TableField()
  @CustomField('设备编号')
  equipmentSn?: string

  @TableField()
  @CustomField('设备名称')
  name?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @TableField()
  @CustomField('调出部门')
  outOrg?: string

  outOrgId?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @TableField()
  @CustomField('调入部门')
  inOrg?: string

  inOrgId?: string

  @FormField()
  @CustomField('存放位置')
  storageSite?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @CustomField('所属功能室')
  laboratoryId?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('调拨时间')
  allotTime?: Date

  @FormField()
  @TableField()
  @CustomField('调拨说明')
  allotExplain?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('申请时间')
  declare createDate: Date

  @TableField()
  @CustomField('申请人')
  declare createName: string

  @TableField()
  @CustomField('状态', EquipmentAssetAllotStatusDict)
  applyStatus!: EquipmentAssetAllotStatus

  attachmentIds?: string

  files?: any

  outOrgType?: any

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
