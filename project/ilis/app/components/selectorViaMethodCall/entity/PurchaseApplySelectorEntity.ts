import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'

export enum EPurchaseApplyStatus {
  /** 填写中 */
  IN_FILLING = 'IN_FILLING',
  /** 待提交 */
  PENDING_SUBMIT = 'PENDING_SUBMIT',
  /** 审核中 */
  UNDER_REVIEW = 'UNDER_REVIEW',
  /** 未通过 */
  NOT_APPROVED = 'NOT_APPROVED',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
}

export const purchaseApplyStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '填写中',
    key: EPurchaseApplyStatus.IN_FILLING,
    color: 'blue',
  },
  {
    label: '待提交',
    key: EPurchaseApplyStatus.PENDING_SUBMIT,
    color: 'blue',
  },
  {
    label: '审核中',
    key: EPurchaseApplyStatus.UNDER_REVIEW,
    color: 'orange',
  },
  {
    label: '未通过',
    key: EPurchaseApplyStatus.NOT_APPROVED,
    color: 'red',
  },
  {
    label: '已完成',
    key: EPurchaseApplyStatus.COMPLETED,
    color: 'green',
  },
])

/**
 * # 采购申请分页列表实体（用于 IlisTable 展示）
 */
export class PurchaseApplyListEntity extends AnyDataBaseEntity {
  @TableField({ width: 100 })
  @CustomField('申请单号')
  requestCode?: string

  @TableField({ width: 100 })
  @CustomField('申请原因')
  requestReason?: string

  @TableField({ width: 100 })
  @CustomField('申请部门')
  requestDepartment?: string

  @TableField({ width: 80 })
  @CustomField('申请人')
  applicant?: string

  @TableField({ width: 150, dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS })
  @CustomField('申请时间')
  requestTime?: string

  @TableField({ width: 100 })
  @CustomField('申请备注')
  description?: string

  @TableField({ width: 70 })
  @CustomField('状态', purchaseApplyStatusDict)
  status?: EPurchaseApplyStatus

  items?: PurchaseApplyItemEntity[]
}

/**
 * # 采购申请单明细项
 */
export class PurchaseApplyItemEntity extends AnyDataBaseEntity {
  @CustomField('化学名称')
  @TableField({ width: 100 })
  name?: string

  @CustomField('品名编号')
  @TableField({ width: 100 })
  code?: string

  @CustomField('规格')
  @TableField({ width: 100 })
  standard?: string

  @CustomField('数量')
  @TableField({ width: 80 })
  amount?: number

  @CustomField('单位')
  @TableField({ width: 80 })
  unit?: string

  @CustomField('备注')
  @TableField({ width: 100 })
  description?: string
}
