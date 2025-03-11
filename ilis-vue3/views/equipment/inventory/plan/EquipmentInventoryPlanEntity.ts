import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
/**
 * # 设备盘点计划状态枚举
 */
export enum EquipmentInventoryPlanStatus {
  /** # 待提交 */
  WAIT_APPROVE = 'PENDING',
  /** # 审核中 */
  APPROVE_ING = 'AUDIT',
  /** # 已通过 */
  APPROVE_SUCCESS = 'DONE',
  /** # 未通过 */
  APPROVE_FAIL = 'REJECT',
}

/**
 * # 设备盘点计划状态字典
 */
export const EquipmentInventoryPlanStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentInventoryPlanStatus.WAIT_APPROVE, label: '待提交', color: '#0066ec' },
  { key: EquipmentInventoryPlanStatus.APPROVE_ING, label: '审核中', color: '#f59a23' },
  { key: EquipmentInventoryPlanStatus.APPROVE_SUCCESS, label: '已通过', color: '#70b603' },
  { key: EquipmentInventoryPlanStatus.APPROVE_FAIL, label: '未通过', color: '#d9001b' },
])

/**
 * # 设备盘点计划entity
 */
export class EquipmentInventoryPlanEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('盘点单号/盘点单名称')
  queryCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
    placeholder: '保存后自动生成',
  })
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

  @TableField()
  @CustomField('计划盘点数量')
  planCount?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    customRender: ({ record }: { record: EquipmentInventoryPlanEntity }) => {
      return `${AnyDateTimeHelper.format(record.planTimeBegin || '', EDateFormatType.YYYY_MM_DD)}~${AnyDateTimeHelper.format(record.planTimeEnd || '', EDateFormatType.YYYY_MM_DD)}`
    },
  })
  @CustomField('计划盘点日期')
  planTime?: Date[]

  planTimeBegin?: Date
  planTimeEnd?: Date

  @FormField()
  @TableField()
  @CustomField('盘点说明')
  description?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField()
  @CustomField('状态', EquipmentInventoryPlanStatusDict)
  status?: EquipmentInventoryPlanStatus

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
