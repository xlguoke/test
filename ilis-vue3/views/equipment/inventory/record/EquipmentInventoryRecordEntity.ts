import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 设备盘点记录状态枚举
 */
export enum EquipmentInventoryRecordStatus {
  /** # 进行中 */
  UNDER_WAY = '10',
  /** # 待提交 */
  WAIT_APPROVE = '20',
  /** # 审核中 */
  APPROVE_ING = '30',
  /** # 未通过 */
  APPROVE_FAIL = '40',
  /** # 已通过 */
  APPROVE_SUCCESS = '50',
}

/**
 * # 设备盘点记录状态字典
 */
export const EquipmentInventoryRecordStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentInventoryRecordStatus.UNDER_WAY, label: '进行中', color: '#555555' },
  { key: EquipmentInventoryRecordStatus.WAIT_APPROVE, label: '待提交', color: '#0066ec' },
  { key: EquipmentInventoryRecordStatus.APPROVE_ING, label: '审核中', color: '#f59a23' },
  { key: EquipmentInventoryRecordStatus.APPROVE_SUCCESS, label: '已通过', color: '#70b603' },
  { key: EquipmentInventoryRecordStatus.APPROVE_FAIL, label: '未通过', color: '#d9001b' },
])

/**
 * # 盘点来源枚举 CREATE-新建盘点  PLAN-盘点计划
 */
export enum EquipmentInventoryPlanType {
  /** # 新建盘点 */
  CREATE = 'CREATE',
  /** # 盘点计划 */
  PLAN = 'PLAN',
}

/**
 * # 盘点来源字典
 */
export const EquipmentInventoryPlanTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentInventoryPlanType.CREATE, label: '新建盘点' },
  { key: EquipmentInventoryPlanType.PLAN, label: '盘点计划' },
])

/**
 * # 设备盘点记录entity（盘点单）
 */
export class EquipmentInventoryRecordEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('盘点单号/盘点单名称')
  queryCode?: string

  @FormField()
  @TableField()
  @CustomField('盘点单号')
  inventorySn?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('盘点单名称')
  inventoryName?: string

  @FormField({
    formType: EFormItemType.SELECT,
    disabled: true,
  })
  @TableField()
  @CustomField('盘点来源', EquipmentInventoryPlanTypeDict)
  inventoryType?: EquipmentInventoryPlanType

  @TableField({
    customRender: ({ record }: { record: EquipmentInventoryRecordEntity }) => {
      return `${record.inventoryCount}/${record.count}`
    },
  })
  @CustomField('盘点进度')
  inventoryProgress?: string

  /**
   * 盘点数量
   */
  count?: number

  /**
   * 已盘点数量
   */
  inventoryCount?: number

  @FormField()
  @CustomField('盘点说明')
  description?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('状态', EquipmentInventoryRecordStatusDict)
  status?: string

  @TableField()
  @CustomField('创建人')
  declare createName: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('创建日期')
  declare createDate: Date

  /**
   * # 审核不通过的数据返回
   */
  @CustomField('审核人')
  auditUserName?: string

  /**
   * # 审核不通过的数据返回
   */
  @CustomField('审核意见')
  auditComment?: string

  /**
   * # 审核中的数据返回
   */
  @CustomField('下一个审核人员')
  nextAuditUserName?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation!: any
}
