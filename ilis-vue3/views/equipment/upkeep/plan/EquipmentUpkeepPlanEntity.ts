import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import PersonSelector from '~/components/selectorViaMethodCall/PersonSelector.vue'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'
/**
 * # 设备保养计划状态枚举（待提交、审核中、已通过、未通过、被驳回）
 */
export enum EquipmentUpkeepPlanStatus {
  /** # 待提交 */
  WAIT_APPROVE = '10',
  /** # 审核中 */
  APPROVE_ING = '20',
  /** # 未通过 */
  APPROVE_FAIL = '30',
  /** # 已通过 */
  APPROVE_SUCCESS = '40',
}

/**
 * # 设备保养计划状态字典
 */
export const EquipmentUpkeepPlanStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentUpkeepPlanStatus.WAIT_APPROVE, label: '待提交', color: '#0066ec' },
  { key: EquipmentUpkeepPlanStatus.APPROVE_ING, label: '审核中', color: '#f59a23' },
  { key: EquipmentUpkeepPlanStatus.APPROVE_SUCCESS, label: '已通过', color: '#70b603' },
  { key: EquipmentUpkeepPlanStatus.APPROVE_FAIL, label: '未通过', color: '#d9001b' },
])

/**
 * # 设备保养计划类型枚举（年度、月度）
 */
export enum EquipmentUpkeepPlanType {
  /** # 年度 */
  YEAR = '1',
  /** # 月度 */
  MONTH = '2',
}

/**
 * # 设备保养计划类型字典
 */
export const EquipmentUpkeepPlanTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentUpkeepPlanType.YEAR, label: '年度计划' },
  { key: EquipmentUpkeepPlanType.MONTH, label: '月度计划' },
])

export class EquipmentUpkeepPlanEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('计划编号/计划名称')
  quickQryParam?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('计划名称')
  name?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
    placeholder: '保存后自动生成',
  })
  @TableField()
  @CustomField('计划编号')
  sn?: string

  @FormField({
    formType: EFormItemType.RADIO,
  })
  @TableField()
  @CustomField('计划类型', EquipmentUpkeepPlanTypeDict)
  type = EquipmentUpkeepPlanType.MONTH

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入年份',
  })
  @TableField({
    customRender: ({ record }: { record: EquipmentUpkeepPlanEntity }) => {
      return record.planMonth && record.type === EquipmentUpkeepPlanType.MONTH ? `${record.planYear}年${record.planMonth}月` : `${record.planYear}年`
    },
  })
  @CustomField('计划年月')
  planYear?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入月份',
  })
  @CustomField('计划月份')
  planMonth?: string

  @TableField()
  @CustomField('计划保养数量')
  count?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField()
  @CustomField('状态', EquipmentUpkeepPlanStatusDict)
  status?: EquipmentUpkeepPlanStatus

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    disabled: true,
    selectorConfig: {
      selectorView: PersonSelector,
      onSelect: (value: IUserSelectVoEntity[], formData: EquipmentUpkeepPlanEntity) => {
        formData.creator = value[0]?.name
        formData.creatorId = value[0]?.id
      },
    },
  })
  @TableField()
  @CustomField('制定人')
  creator?: string

  creatorId?: string

  @TableField({
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('制定日期')
  declare createDate: Date

  @FormField()
  @TableField()
  @CustomField('计划说明')
  explains?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
