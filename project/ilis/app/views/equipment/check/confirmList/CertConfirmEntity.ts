import type { CustomRecordEntity } from './CustomRecordEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

const ConfirmResultsDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '合格', key: '合格' },
  { label: '不合格', key: '不合格' },
])

const IsCorrectDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '是', key: '是' },
  { label: '否', key: '否' },
])

/**
 * # 证书结果确认entity
 */
export class CertConfirmEntity extends AnyDataBaseEntity {
  @TableField({ width: 120 })
  @CustomField('检校项目/参数')
  checkItemName?: string

  @TableField({ width: 120 })
  @CustomField('计量确认标准依据')
  applyRegulations?: string

  @TableField({ width: 120 })
  @CustomField('试验规程')
  testSpecifications?: string

  @TableField({ width: 120 })
  @CustomField('技术要求')
  skillLimit?: string

  @FormField()
  @TableField({ width: 120 })
  @CustomField('检校结果')
  checkedInfo?: string

  @FormField({ formType: EFormItemType.SELECT })
  @TableField({ width: 120 })
  @CustomField('确认结果', ConfirmResultsDict)
  confirmResults?: string

  @FormField()
  @TableField({ width: 120 })
  @CustomField('适用参数')
  applyParam?: string

  @FormField({ formType: EFormItemType.SELECT })
  @TableField({ width: 120 })
  @CustomField('是否使用修正因子/修正值', IsCorrectDict)
  isCorrect?: string

  correctValue?: string

  @FormField({ formType: EFormItemType.DATE, dateFormat: EDateFormatType.YYYY_MM_DD })
  @TableField({ width: 120, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('本次确认时间')
  checkTime?: string

  @TableField({ width: 120, dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('上次确认时间')
  preCheckDate?: string

  @FormField()
  @TableField({ width: 120 })
  @CustomField('备注说明')
  remark?: string

  @CustomField('检查项目/参数id')
  checkItemId!: string

  @CustomField('过程记录')
  details?: CustomRecordEntity[]

  @CustomField('确认意见')
  detailOpinion?: string

  @TableField({
    isAlways: true,
    width: 160,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any

  @CustomField('是否与系统参数匹配')
  matched?: boolean
}
