import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import VMCallPersonSelector from '~/components/selectorViaMethodCall/VMCallPersonSelector.vue'

/**
 * # 检测任务entity
 */
export class TaskReviewEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '输入任务编号/记录编号/样品编号/报告编号/样品名称后回车即可查询',
  })
  @SearchField({ width: '400px' })
  @CustomField('快捷查询')
  quickQryParam?: string

  @TableField({ width: 120, isAlways: true })
  @CustomField('状态')
  _mark?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('委托单位')
  consignUnitName?: string // todo

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('委托编号')
  consignCode?: string

  @TableField({ width: 120 })
  @CustomField('委托日期')
  consignDate?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('委托日期')
  consignDateRange?: string[] // TODO

  @TableField({ width: 120 })
  @CustomField('数据状态')
  processStatus?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField({ width: 120, sorter: true })
  @SearchField({ isAdvanced: true })
  @CustomField('样品编号')
  testObjectCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120, sorter: true })
  @CustomField('任务编号')
  testTaskCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120, sorter: true })
  @CustomField('记录编号')
  testRecordCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120, sorter: true })
  @CustomField('报告编号')
  reportCode?: string

  @TableField({ width: 120 })
  @CustomField('样品名称')
  testSampleDisplayName?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('样品名称')
  testObjectName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('检测参数')
  testParamName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('工程项目')
  projectName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('项目编号')
  projectCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('所属部门')
  departName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('项目负责人')
  projectPrincipal?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('项目创建人')
  projectCreator?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    isOnlySearch: true,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      multiple: true,
      onSelect: (value: IUserSelectVoEntity[], formData: TaskReviewEntity) => {
        formData.testUser = value.map(i => i.name).join(',')
        formData.testPerson = value.map(i => i.id).join(',')
      },
    },
  })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('检测人员')
  testUser?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isHidden: true })
  testPerson?: string // 高级查询-检测人员

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('检测时间')
  testDateRange?: Date[]

  @TableField({ width: 120, sorter: true })
  @CustomField('检测时间')
  testTime?: string

  @TableField({ width: 120, sorter: true })
  @CustomField('报告提交时间')
  submitDate?: string // TODO新增排序字段

  @TableField({ width: 120 })
  @CustomField('复核')
  reportReconfirm?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    isOnlySearch: true,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      multiple: true,
      onSelect: (value: IUserSelectVoEntity[], formData: TaskReviewEntity) => {
        formData.reviewer = value.map(i => i.name).join(',')
        formData.reviewerIds = value.map(i => i.id).join(',')
      },
    },
  })
  @SearchField({ isAdvanced: true })
  @CustomField('复核人员')
  reviewer?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isHidden: true })
  reviewerIds?: string

  @TableField({ width: 120 })
  @CustomField('批准')
  reportApproved?: string

  @TableField({ width: 120 })
  @CustomField('审核')
  reportAudit?: string

  @TableField({
    width: 180,
    fixed: 'right',
    isAlways: true,
  })
  @CustomField('操作')
  operation?: string
}
