import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { getQualificationType } from '~/views/consign/consignList/dictApi.ts'

const { getOrgToDict, getLabToDict, getSystemDict } = useCommonDataDict()

/**
 * # 使用时间筛选类型枚举
 */
export enum TimeSearchType {
  /** # 已录入使用时间 */
  Entered = '1',
  /** # 未录入使用时间 */
  NotEntered = '0',
}

/**
 * # 使用时间筛选类型字典
 */
export const TimeSearchTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: TimeSearchType.Entered, label: '已录入使用时间' },
  { key: TimeSearchType.NotEntered, label: '未录入使用时间' },
])

/**
 * 使用状态
 */
export enum UseState {
  NORMAL = '正常',
  UN_NORMAL = '不正常',
}

/**
 * 使用状态类型字典
 */
export const UseStateDict = AnyDictionaryHelper.createDictionaryArray([
  { key: UseState.NORMAL, label: '正常' },
  { key: UseState.UN_NORMAL, label: '不正常' },
])

/**
 * # 设备使用记录entity
 */
export class EquipmentUsageRecordEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入设备编号',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('快捷查询')
  q?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true, placeholder: '请输入设备编号（精确查询）' })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('设备编号')
  equipmentCode?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('使用时间筛选', TimeSearchTypeDict)
  onlyUseTime?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('使用人')
  username?: string

  @FormField({ formType: EFormItemType.TREE_SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('设备科室', () => getOrgToDict({ all: true }))
  departmentId?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('功能室', () => getLabToDict())
  laboratoryId?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120, sorter: true })
  @CustomField('任务编号')
  testTaskCode?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 180 })
  @CustomField('报告编号')
  reportNumber?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('检测参数')
  testParamName?: string

  @FormField({ formType: EFormItemType.DATE_RANGE, dateFormat: EDateFormatType.YYYY_MM_DD, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('设备使用日期')
  useEquipmentDate?: [string, string]

  @FormField({ formType: EFormItemType.DATE_RANGE, dateFormat: EDateFormatType.YYYY_MM_DD, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('委托日期')
  consignDate?: [string, string]

  @FormField({ formType: EFormItemType.DATE_RANGE, dateFormat: EDateFormatType.YYYY_MM_DD, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('下次检校')
  nextCheckDate?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('样品名称')
  testSampleDisplayName?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 100 })
  @CustomField('使用前状态', UseStateDict)
  startUseState?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 100 })
  @CustomField('使用后状态', UseStateDict)
  endUseState?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 180 })
  @CustomField('样品编号')
  testObjectCode?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 150 })
  @CustomField('资质类型', getQualificationType)
  qualificationType?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 180 })
  @CustomField('试验依据')
  testParamBasisNames?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 150 })
  @CustomField('工程项目')
  projectName?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 150 })
  @CustomField('使用地点')
  usePlace?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 150 })
  @CustomField('设备类别', () => getSystemDict('402882206b72e01e016b72f8bfd80001', 'typename'))
  type?: string

  @TableField({
    sorter: true,
    width: 180,
  })
  @CustomField('使用时间（起~止）')
  startUseTime?: string

  @TableField({ width: 120 })
  @CustomField('设备名称')
  equipmentName?: string

  @TableField({ width: 120 })
  @CustomField('规格型号')
  standard?: string

  @TableField({ width: 120 })
  @CustomField('档案编号')
  archiveSn?: string

  @TableField({ width: 120 })
  @CustomField('检测参数')
  testParamDisplayName?: string

  @TableField({ width: 90 })
  @CustomField('使用人')
  userName?: string

  @TableField({ width: 120 })
  @CustomField('备注')
  remark?: string

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 140,
  })
  @CustomField('操作')
  Action?: any
}
