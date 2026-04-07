import type { EPurchaseApplyStatus } from './types'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { purchaseApplyStatusDict } from './types'

export class AcceptRegisterEntity extends AnyDataBaseEntity {
  @TableField({ width: 130 })
  @CustomField('登记单号')
  registerCode?: string

  @TableField({ width: 100 })
  @CustomField('登记人')
  registrant?: string

  @TableField({ width: 100, dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS })
  @CustomField('登记时间')
  registerTime?: string

  @TableField({ width: 80 })
  @CustomField('验收人')
  verifier?: string

  @TableField({ width: 100, dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS })
  @CustomField('验收时间')
  verifyTime?: string

  @TableField({ width: 100 })
  @CustomField('验收结论')
  verifyConclusion?: string

  @TableField({ width: 80 })
  @CustomField('状态', purchaseApplyStatusDict)
  status?: EPurchaseApplyStatus

  @TableField({ isAlways: true, width: 160, fixed: 'right' })
  @CustomField('操作')
  operation?: any
}

export class AcceptRegisterQueryEntity extends AnyDataBaseEntity {
  @SearchField({ width: '300px' })
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('采购登记号/登记人/验收人')
  q?: string

  @SearchField()
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    showTime: true,
    rangeMap: ['registerTimeStart', 'registerTimeEnd'],
  })
  @CustomField('登记时间')
  registerTimeRange?: [string, string]

  @SearchField()
  @FormField({ formType: EFormItemType.SELECT })
  @CustomField('状态', purchaseApplyStatusDict)
  status?: EPurchaseApplyStatus
}

export class AcceptRegisterItemBaseEntity extends AnyDataBaseEntity {
  chemicalCategoryId?: string
  registerId?: string
  registerCode?: string

  @TableField()
  @CustomField('化学名称')
  chemicalName?: string

  @TableField()
  @CustomField('化学名称编号')
  chemicalCode?: string

  @TableField()
  @CustomField('品名')
  productName?: string

  @TableField()
  @CustomField('品名编号')
  productCode?: string

  @TableField()
  @CustomField('规格')
  specification?: string

  @TableField()
  @CustomField('供应商')
  supplier?: string

  @TableField()
  @CustomField('采购数量')
  purchaseQuantity?: number

  @TableField({ width: 60 })
  @CustomField('单位')
  unit?: string

  @TableField()
  @CustomField('备注')
  remark?: string
}

export class AcceptRegisterItemEntity extends AcceptRegisterItemBaseEntity {
  @TableField({ width: 80, fixed: 'right' })
  @CustomField('操作')
  action?: string
}

export class AcceptRegisterItemFormEntity extends AcceptRegisterItemBaseEntity {
  @TableField({ width: 110 })
  @CustomField('购置日期')
  purchaseDate?: string

  @TableField({ width: 110 })
  @CustomField('生产日期')
  productionDate?: string

  @TableField({ width: 110 })
  @CustomField('失效日期')
  invalidDate?: string

  @TableField({ width: 70 })
  @CustomField('纯度')
  purity?: string

  @TableField({ width: 70 })
  @CustomField('浓度')
  concentration?: string

  @TableField({ width: 120 })
  @CustomField('验收数量')
  verifyQuantity?: number

  @TableField({ width: 130 })
  @CustomField('验收情况')
  verifyQuality?: string

  @TableField({ width: 130 })
  @CustomField('其他')
  verifyExtra?: string

  @TableField({ width: 60, fixed: 'right' })
  @CustomField('操作')
  action?: string
}
