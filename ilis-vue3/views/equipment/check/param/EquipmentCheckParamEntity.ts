import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
/**
 * # 检校周期单位（年、月、日）
 */
export enum CheckPeriodUnit {
  DAY = '日',
  MONTH = '月',
  YEAR = '年',
}

/**
 * # 检校周期单位字典
 */
export const CheckPeriodUnitDict = AnyDictionaryHelper.createDictionaryArray([
  { key: CheckPeriodUnit.DAY, label: '日' },
  { key: CheckPeriodUnit.MONTH, label: '月' },
  { key: CheckPeriodUnit.YEAR, label: '年' },
])

/**
 * # 检校参数entity
 */
export class EquipmentCheckParamEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('检校项目/参数')
  checkItemName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('检校项目/参数')
  name?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('技术要求')
  skillLimit?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    required: true,
  })
  @TableField({
    customRender: ({ record }: { record: EquipmentCheckParamEntity }) => {
      if (record.checkPeriod) {
        return `${record.checkPeriod}${CheckPeriodUnitDict.getLabelByKey(record.checkPeriodUnit)}`
      }
      else {
        return ''
      }
    },
  })
  @CustomField('检校周期')
  checkPeriod?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @CustomField('检校周期单位', CheckPeriodUnitDict)
  checkPeriodUnit = CheckPeriodUnit.YEAR

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('首次检校日期')
  preCheckDate?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('下次检校日期')
  nextCheckDate?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @TableField()
  @CustomField('检验类型', 'eq_ck_type')
  checkType?: string

  @FormField()
  @TableField()
  @CustomField('检校依据')
  checkReference?: string

  @FormField()
  @TableField()
  @CustomField('计量确认标准依据')
  checkConfirmReference?: string

  @FormField()
  @TableField()
  @CustomField('检校单位')
  checkUnit?: string

  @FormField()
  @TableField()
  @CustomField('检校证书编号')
  checkCertificateSn?: string

  @FormField()
  @TableField()
  @CustomField('试验规程')
  testSpecifications?: string

  @FormField()
  @TableField()
  @CustomField('备注')
  remark?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation!: any
}
