import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
/**
 * # 设备核查计划状态枚举（填写中、审批中、审批通过、审批拒绝、被驳回）
 */
export enum EquipmentInspectPlanStatus {
  /** # 填写中 */
  WAIT_APPROVE = '10',
  /** # 审批中 */
  APPROVE_ING = '20',
  /** # 审批拒绝 */
  APPROVE_FAIL = '30',
  /** # 审批通过 */
  APPROVE_SUCCESS = '40',
  /** # 申请被驳回 */
  REJECT = '50',
}

/**
 * # 设备核查计划状态字典
 */
export const EquipmentInspectPlanStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentInspectPlanStatus.WAIT_APPROVE, label: '填写中', color: '#0066ec' },
  { key: EquipmentInspectPlanStatus.APPROVE_ING, label: '审批中', color: '#f59a23' },
  { key: EquipmentInspectPlanStatus.APPROVE_SUCCESS, label: '审批通过', color: '#70b603' },
  { key: EquipmentInspectPlanStatus.APPROVE_FAIL, label: '审批拒绝', color: '#d9001b' },
  { key: EquipmentInspectPlanStatus.REJECT, label: '申请被驳回', color: '#70b603' },
])

/**
 * # 设备核查计划类型枚举（年度、月度）
 */
export enum EquipmentInspectPlanType {
  /** # 年度 */
  YEAR = '1',
  /** # 月度 */
  MONTH = '2',
}

/**
 * # 设备核查计划类型字典
 */
export const EquipmentInspectPlanTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentInspectPlanType.YEAR, label: '年度计划' },
  { key: EquipmentInspectPlanType.MONTH, label: '月度计划' },
])

/**
 * # 期间核查计划entity
 */
export class EquipmentInspectPlanEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('计划类型', EquipmentInspectPlanTypeDict)
  // 搜索用
  type?: EquipmentInspectPlanType

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('计划状态', EquipmentInspectPlanStatusDict)
  // 搜索用
  status?: EquipmentInspectPlanStatus

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @CustomField('计划类型', EquipmentInspectPlanTypeDict)
  planType?: EquipmentInspectPlanType

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入年份',
  })
  @TableField({
    customRender: ({ record }: { record: EquipmentInspectPlanEntity }) => {
      return record.planMouth && record.planType === EquipmentInspectPlanType.MONTH ? `${record.planYear}年${record.planMouth}月` : `${record.planYear}年`
    },
  })
  @CustomField('年/月')
  planYear?: string

  @TableField()
  @CustomField('科室')
  planDepartName?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('科室')
  planDepartId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入月份',
  })
  @CustomField('计划月份')
  planMouth?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
  })
  @CustomField('创建时间')
  declare createDate: Date

  @TableField()
  @CustomField('计划状态', EquipmentInspectPlanStatusDict)
  planStatus?: EquipmentInspectPlanStatus

  @FormField()
  @TableField()
  @CustomField('备注')
  remark?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
