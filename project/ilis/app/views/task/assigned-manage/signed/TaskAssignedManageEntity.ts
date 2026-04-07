import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import VMCallPersonSelector from '~/components/selectorViaMethodCall/VMCallPersonSelector.vue'
import { EDateFormatType } from '~/utils/EDateFormatType'

/** # 任务状态枚举 */
export enum TaskStatus {
  /** 待分配 */
  PENDING = '10',
  /** 试验检测中 */
  DETECTING = '20',
  /** 复核确认中 */
  REVIEWING = '30',
  /** 已提交正式报告 */
  SUBMITTED = '40',
}

/** # 任务状态字典 */
export const TaskStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '待分配', key: TaskStatus.PENDING },
  { label: '试验检测中', key: TaskStatus.DETECTING },
  { label: '复核确认中', key: TaskStatus.REVIEWING },
  { label: '已提交正式报告', key: TaskStatus.SUBMITTED },
])

/** # 任务分配管理实体（已分配） */
export class TaskAssignedManageEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入委托编号/样品编号/委托单位',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQryParam?: string // 搜索用

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @TableField({ sorter: true })
  @CustomField('任务编号')
  testTaskCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('记录编号')
  recordCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @TableField({ sorter: true })
  @CustomField('委托编号')
  consignCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @TableField({ sorter: true })
  @CustomField('样品编号')
  testObjectCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('样品名称')
  testObjectName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('委托单位')
  consignUnitName?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    isOnlySearch: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['consignDateStart', 'consignDateEnd'],
  })
  @SearchField({ isAdvanced: true })
  @CustomField('委托日期')
  consignDateSearch?: Date[]

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    isOnlySearch: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['arriveAssignTimeStart', 'arriveAssignTimeEnd'],
  })
  @SearchField({ isAdvanced: true })
  @CustomField('进入分配日期')
  arriveAssignTimeSearch?: Date[]

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('资质类型')
  qualificationType?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    isOnlySearch: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['allocDateStart', 'allocDateEnd'],
  })
  @SearchField({ isAdvanced: true })
  @CustomField('任务分配日期')
  allocDateSearch?: Date[]

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
  @TableField({ sorter: true })
  @CustomField('所属部门') // 在查询里叫所属部门，在表格里叫检测部门——依赖自定义列数据生成；（我也不知道咋想的😒）
  departName?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    isOnlySearch: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['requireReportDateStart', 'requireReportDateEnd'],
  })
  @SearchField({ isAdvanced: true })
  @CustomField('要求报告日期')
  requireReportDateSearch?: Date[]

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
    formType: EFormItemType.RADIO,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('任务状态', TaskStatusDict.exclude([TaskStatus.PENDING]))
  status?: TaskStatus

  @TableField()
  @CustomField('任务状态', TaskStatusDict)
  testTaskStatus?: TaskStatus

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    isOnlySearch: true,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      multiple: true,
      onSelect: (value: IUserSelectVoEntity[], formData: TaskAssignedManageEntity) => {
        formData.qryPersonName = value.map(i => i.name).join(',')
        formData.qryPerson = value.map(i => i.id).join(',')
      },
    },
  })
  @SearchField({ isAdvanced: true })
  @CustomField('检测人员')
  qryPersonName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isHidden: true })
  qryPerson?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    isOnlySearch: true,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      multiple: true,
      onSelect: (value: IUserSelectVoEntity[], formData: TaskAssignedManageEntity) => {
        formData.assignerName = value.map(i => i.name).join(',')
        formData.assignerIds = value.map(i => i.id).join(',')
      },
    },
  })
  @SearchField({ isAdvanced: true })
  @CustomField('任务分配人')
  assignerName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isHidden: true })
  assignerIds?: string

  @TableField({ dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('要求报告日期')
  requireReportDate?: string

  @TableField({ dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('报告提交时间')
  submitDate?: string

  @TableField({ dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('进入分配日期')
  arriveAssignTime?: string

  @TableField({ dateFormat: EDateFormatType.YYYY_MM_DD, sorter: true })
  @CustomField('任务分配日期')
  allocDate?: string

  @TableField({ dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('委托日期')
  consignDate?: string

  testTaskId?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('标记')
  _mark?: any

  @TableField({
    fixed: 'right',
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
