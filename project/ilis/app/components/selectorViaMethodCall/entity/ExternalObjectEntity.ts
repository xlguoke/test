import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 外部检测对象实体
 */
export class ExternalObjectEntity extends AnyDataBaseEntity {
  /** 样品名称 */
  @FormField({ formType: EFormItemType.INPUT, required: true })
  @SearchField()
  @TableField()
  @CustomField('样品名称')
  testSampleDisplayName?: string

  /** 规格型号 */
  @FormField({ formType: EFormItemType.INPUT, required: true })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('规格型号')
  standard?: string

  /** 样品编号 */
  @FormField({ formType: EFormItemType.INPUT })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('样品编号')
  testObjectCode?: string

  /** 来样编号 */
  @FormField({ formType: EFormItemType.INPUT })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('来样编号')
  provideToCustomerSampleCode?: string

  /** 试样数量 */
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('试样数量')
  quantity?: string

  /** 代表数量 */
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('代表数量')
  representNum?: string

  /** 生产厂家 */
  @FormField({ formType: EFormItemType.INPUT })
  @TableField()
  @CustomField('生产厂家')
  manufacturer?: string

  /** 生产产地 */
  @FormField({ formType: EFormItemType.INPUT })
  @TableField()
  @CustomField('生产产地')
  manufactureLocation?: string

  /** 生产日期 */
  @FormField({ formType: EFormItemType.DATE, dateFormat: EDateFormatType.YYYY_MM_DD })
  @TableField()
  @CustomField('生产日期')
  manufactureDate?: string

  /** 出厂日期 */
  @FormField({ formType: EFormItemType.DATE, dateFormat: EDateFormatType.YYYY_MM_DD })
  @TableField()
  @CustomField('出厂日期')
  ccrq?: string

  /** 批号 */
  @FormField({ formType: EFormItemType.INPUT })
  @TableField()
  @CustomField('批号')
  batchNumber?: string

  /** 外部委托编号 */
  @FormField({ formType: EFormItemType.INPUT })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('外部委托编号')
  externalConsignCode?: string

  /** 报告编号 */
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('报告编号')
  reportCodes?: string

  /** 取样地点 */
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('取样地点')
  samplingPlace?: string

  /** 样品描述 */
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('样品描述')
  description?: string

  /** 本机构内委托编号 */
  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('本机构内委托编号')
  consignCode?: string

  /** 是否引用 */
  @CustomField('是否引用')
  referred?: boolean | null

  /** 样品数量 */
  @CustomField('样品数量')
  sampleNum?: string

  /** 外来样品id */
  @CustomField('外来样品id')
  externalObjectId?: string

  /** 掺量单位 */
  @CustomField('推荐掺量')
  recommendedDosage?: string

  /** 用量kg/m³ */
  @CustomField('用量kg/m³')
  dosage?: string

  /** 单位比 */
  @CustomField('单位比')
  unitRatio?: string

  /** 备注 */
  @CustomField('备注')
  remark?: string

  /** 唯一标识 */
  mark?: string
  /** 样品类型：主样品无type 1-引用的原材料 2-参配样品 3-外来样品（referred属性为true的则是引用的外来样品） 4-添加的子样品 */
  type?: number
}
