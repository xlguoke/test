import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export const DepartmentFilterDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '当前部门能分配的', key: '1' },
  { label: '当前部门（含下级部门）能分配的', key: '2' },
  { label: '未指定部门的', key: '3' },
])

export const SubcontractFilterDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '是', key: true },
  { label: '否', key: false },
])

/** # 任务分配管理实体 */
export class TaskUnAssignedManageEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入委托编号/样品编号/样品名称/工程部位/用途',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQryParam?: string // 搜索用

  @TableField({
    isAlways: true,
  })
  @CustomField('标记')
  status?: any

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('检测部门', DepartmentFilterDict)
  filterByDepartment?: string // 搜索用

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('委托是否已约定分包', SubcontractFilterDict)
  subcontract?: boolean // 搜索用

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('委托单位')
  consignUnitName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('资质类型')
  qualificationType?: string

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
  @CustomField('检测参数')
  parameter?: string

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
  @CustomField('项目负责人')
  projectPrincipal?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('项目创建人')
  projectCreator?: string

  // @TableField({ sorter: true })
  // @CustomField('检测部门')
  // departName?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    isOnlySearch: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField({ isAdvanced: true })
  @TableField({
    sorter: true,
    customRender: ({ text }) => {
      if (text === '***') {
        return
      }
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  })
  @CustomField('委托日期')
  consignDate?: string

  @TableField({
    customRender: ({ text }) => {
      if (text === '***') {
        return
      }
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  })
  @CustomField('进入分配日期')
  arriveAssignTime?: string

  @TableField({
    customRender: ({ text }) => {
      if (text === '***') {
        return
      }
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  })
  @CustomField('要求报告日期')
  requireReportDate?: string

  @TableField({
    fixed: 'right',
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
