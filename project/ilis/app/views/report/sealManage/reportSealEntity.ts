import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 报告印章管理是否重复字典
 */
export const ReportSealDict = AnyDictionaryHelper.createDictionaryArray([
  { key: '0', label: '不重复' },
  { key: '1', label: '重复' },
])

interface Stamp {
  sealId: string
  sealName: string
}

export class ReportSealEntity extends AnyDataBaseEntity {
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('用印日期')
  stampingDate?: Date

  @TableField()
  @CustomField('项目编号')
  projectSn?: string

  @TableField()
  @CustomField('报告名称')
  sampleName?: string

  @TableField()
  @CustomField('报告编号')
  reportSn?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('报告签发日期')
  signDate?: Date

  @TableField({
    width: '200px',
  })
  @CustomField('使用印章名称')
  stamps?: Stamp[]

  @TableField()
  @CustomField('份数')
  number?: string

  @TableField()
  @CustomField('是否生成二维码')
  generateQrCode?: boolean

  @TableField()
  @CustomField('经办人')
  operator?: string

  @TableField()
  @CustomField('批准人')
  approver?: string

  @TableField()
  @CustomField('备注')
  remark?: string

  @TableField()
  @SearchField()
  @FormField({
    formType: EFormItemType.SELECT,
  })
  @CustomField('是否重复', ReportSealDict)
  repetitive?: boolean

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
  })
  @CustomField('登记时间')
  registerTime?: Date

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    isOnlySearch: true,

  })
  @SearchField()
  @CustomField('扫码登记时间')
  registerTimeRange?: string[]

  @CustomField('最新一次扫登记时间')
  lastRegisterTime?: string[]

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 100,
  })
  @CustomField('操作')
  operation?: any
}
