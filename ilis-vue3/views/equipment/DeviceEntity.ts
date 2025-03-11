import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
/**
 * # 设备调拨状态枚举
 */
export enum DeviceTransferStatus {
  /** # 闲置中 */
  IDLE = '10',
  /** # 调拨中 */
  TRANSFER = '20',
  /** # 使用中 */
  USING = '30',
  /** # 已安装 */
  INSTALLED = '40',
  /** # 已移交 */
  TRANSFERRED = '50',
}

/**
 * # 设备调拨状态字典
 */
export const DeviceTransferStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: DeviceTransferStatus.IDLE, label: '闲置中' },
  { key: DeviceTransferStatus.TRANSFER, label: '调拨中' },
  { key: DeviceTransferStatus.USING, label: '使用中' },
  { key: DeviceTransferStatus.INSTALLED, label: '已安装' },
  { key: DeviceTransferStatus.TRANSFERRED, label: '已移交' },
])

/**
 * # 设备外出状态枚举
 */
export enum EgressStatus {
  /** # 库存 */
  STOCK = '10,30',
  /** # 外出 */
  OUT = '40,60',
  /** # 外出待确认 */
  OUT_CONFIRM = '20',
  /** # 归还待确认 */
  RETURN_CONFIRM = '50',
}

/**
 * # 设备外出状态字典
 */
export const EgressStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EgressStatus.STOCK, label: '库存' },
  { key: EgressStatus.OUT, label: '外出' },
  { key: EgressStatus.OUT_CONFIRM, label: '外出待确认' },
  { key: EgressStatus.RETURN_CONFIRM, label: '归还待确认' },
])

/**
 * # 设备实体
 */
export class DeviceEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('所属部门')
  eqDepartId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入设备名称/设备编号/资产编号/规格型号',
  })
  @SearchField()
  quickQryParam?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('设备类别', 'eq_type', 'typeName')
  eqType?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('管理类别', 'eq_m_type', 'typeName')
  manageType?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('出厂编号')
  factorySn?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('设备状态', 'eq_status', 'typeName')
  eqStatus?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('设备名称')
  // 搜索用
  eqName?: string

  @TableField()
  @CustomField('设备名称')
  name?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('设备编号')
  equipmentSn?: string

  @TableField()
  @CustomField('资产编号')
  assetSn?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('规格型号')
  // 搜索用
  eqStandard?: string

  @TableField()
  @CustomField('规格型号')
  standard?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('供应商')
  supplier?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('所属功能室')
  eqLaboratoryName?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('所属单位')
  eqUnitName?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('调拨状态', DeviceTransferStatusDict)
  transferStatus?: DeviceTransferStatus

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('保管人')
  keeperName?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('出入库状态', EgressStatusDict)
  egressStatus?: string

  @FormField({
    formType: EFormItemType.SWITCH,
    isOnlySearch: true,
    checkedValue: '1',
    unCheckedValue: '0',
  })
  @SearchField({ isAdvanced: true })
  @CustomField('是否为公路水运系统相关设备')
  isGlsy?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('购置日期')
  // 搜索用
  buyDateSearch?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('检校日期')
  // 搜索用
  checkDateSearch?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('下次检校日期')
  // 搜索用
  nextCheckDateSearch?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('购置日期')
  buyDate?: string

  @CustomField('所属部门')
  departId?: string

  @TableField()
  @CustomField('所属部门')
  departName?: string

  @TableField()
  @CustomField('设备类别')
  type?: string

  @TableField()
  @CustomField('设备状态')
  status?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('存放位置')
  storageSite?: string

  @TableField()
  @CustomField('检测室')
  laboratoryName?: string

  @TableField()
  @CustomField('数量')
  quantity?: string

  @TableField()
  @CustomField('检校类型')
  checkType?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('前次检校')
  preCheckDate?: Date

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('下次检校')
  nextCheckDate?: Date

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('生产厂家')
  factory?: string

  @TableField()
  @CustomField('使用人')
  userName?: string

  @TableField()
  @CustomField('操作')
  operation?: any
}
