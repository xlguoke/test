import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { getQualificationType } from '~/views/consign/consignList/dictApi.ts'
import { UseStateDict } from '~/views/equipment/usage-record/EquipmentUsageRecordEntity.ts'

/**
 * # 设备使用记录entity（指定设备用）
 */
export class EquipmentUsageRecordDetailEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '输入样品名称、检测参数或使用人后回车即可查询',
    isOnlySearch: true,
  })
  @SearchField({ width: '380px' })
  @CustomField('快捷查询')
  eqDetailQuickQryParam?: string

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

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('样品名称')
  testSampleDisplayName?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 120 })
  @CustomField('检测参数')
  testParamName?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 180 })
  @CustomField('样品编号')
  testObjectCode?: string

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
  @CustomField('使用人')
  username?: string

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
  @TableField({ width: 100 })
  @CustomField('使用前状态', UseStateDict)
  startUseState?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({ width: 100 })
  @CustomField('使用后状态', UseStateDict)
  endUseState?: string

  @TableField({
    sorter: true,
    width: 180,
  })
  @CustomField('使用时间（起~止）')
  startUseTime?: string

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
