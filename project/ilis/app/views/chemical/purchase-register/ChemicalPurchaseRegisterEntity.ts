import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { purchaseApplyStatusDict } from '~/components/selectorViaMethodCall/entity/PurchaseApplySelectorEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 化学品采购登记实体
 */
export class ChemicalPurchaseRegisterEntity extends AnyDataBaseEntity {
  @TableField({ width: 130 })
  @CustomField('采购登记单号')
  registerCode?: string

  @TableField({ width: 100 })
  @CustomField('登记人')
  registrant?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
  })
  @CustomField('登记时间')
  registerTime?: string

  @TableField({ width: 80 })
  @CustomField('验收人')
  verifier?: string

  @TableField({ width: 70 })
  @CustomField('状态', purchaseApplyStatusDict)
  status?: string

  @TableField({
    isAlways: true,
    width: 80,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any
}

/**
 * # 采购登记查询参数
 */
export class ChemicalPurchaseRegisterQueryEntity extends AnyDataBaseEntity {
  @SearchField({ width: '300px' })
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('化学名称/编号/规格/供应商/登记人')
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
}

/**
 * # 采购登记明细项 - 基础实体
 */
export class ChemicalPurchaseRegisterItemBaseEntity extends AnyDataBaseEntity {
  chemicalCategoryId?: string
  registerId?: string
  registerCode?: string

  @TableField({ fixed: 'left' })
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
  @CustomField('数量')
  purchaseQuantity?: number

  @TableField({ width: 60 })
  @CustomField('单位')
  unit?: string

  @TableField()
  @CustomField('备注')
  remark?: string
}

/**
 * # 采购登记明细项 - 用于新增/编辑表单
 */
export class ChemicalPurchaseRegisterItemFormEntity extends ChemicalPurchaseRegisterItemBaseEntity {
  @TableField({ width: 120 })
  @CustomField('购置日期')
  purchaseDate?: string

  @TableField({ width: 120 })
  @CustomField('生产日期')
  productionDate?: string

  @TableField({ width: 120 })
  @CustomField('失效日期')
  invalidDate?: string

  @TableField({ width: 70 })
  @CustomField('纯度')
  purity?: string

  @TableField({ width: 70 })
  @CustomField('浓度')
  concentration?: string

  @TableField({ width: 60, fixed: 'right' })
  @CustomField('操作')
  action?: string
}

/**
 * # 化学品选择实体
 */
export class ChemicalSelectorEntity extends AnyDataBaseEntity {
  @TableField({ width: 150 })
  @CustomField('化学名称')
  chemicalName?: string

  @TableField({ width: 150 })
  @CustomField('化学名称编号')
  chemicalCode?: string

  @TableField({ width: 120 })
  @CustomField('所属类别')
  categoryName?: string

  @TableField({ width: 120 })
  @CustomField('管理级别')
  managementLevel?: string

  @TableField({ width: 120 })
  @CustomField('用途')
  purpose?: string

  @TableField()
  @CustomField('纯度')
  purity?: string

  @TableField()
  @CustomField('浓度')
  concentration?: string

  @TableField()
  @CustomField('计量单位')
  unit?: string

  @TableField({ width: 120 })
  @CustomField('可支配库存')
  availableStock?: number

  @TableField({ width: 120 })
  @CustomField('预警数量')
  warningQuantity?: number
}

/**
 * # 采购申请单选择实体
 */
export class PurchaseApplySelectorEntity extends AnyDataBaseEntity {
  @TableField({ width: 150 })
  @CustomField('申请单号')
  applyCode?: string

  @TableField({ width: 150 })
  @CustomField('申请原因')
  applyReason?: string

  @TableField({ width: 150 })
  @CustomField('申请部门')
  applyDepartName?: string

  @TableField({ width: 120 })
  @CustomField('申请人')
  applyUserName?: string

  @TableField({ width: 180, dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS })
  @CustomField('申请时间')
  applyTime?: string

  @TableField({ width: 150 })
  @CustomField('申请备注')
  applyRemark?: string

  @TableField()
  @CustomField('状态')
  status?: string
}
