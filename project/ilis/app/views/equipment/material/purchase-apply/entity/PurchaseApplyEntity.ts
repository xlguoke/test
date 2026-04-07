import type { PurchaseApplyDetailEntity } from './PurchaseApplyDetailEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export enum EPurchaseApplyStatus {
  WRITING = 'WRITING',
  AUDITING = 'AUDITING',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
}

export const PurchaseApplyStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EPurchaseApplyStatus.WRITING, label: '填写中', color: '#0066EC' },
  { key: EPurchaseApplyStatus.AUDITING, label: '审核中', color: '#F59A23' },
  { key: EPurchaseApplyStatus.PASSED, label: '已通过', color: '#4B7902' },
  { key: EPurchaseApplyStatus.REJECTED, label: '未通过', color: '#D9001B' },
])
export const PurchaseApplyStatusMap = {
  [EPurchaseApplyStatus.WRITING]: {
    label: '填写中',
    color: '#0066EC',
  },
  [EPurchaseApplyStatus.AUDITING]: {
    label: '审核中',
    color: '#F59A23',
  },
  [EPurchaseApplyStatus.PASSED]: {
    label: '已通过',
    color: '#4B7902',
  },
  [EPurchaseApplyStatus.REJECTED]: {
    label: '未通过',
    color: '#D9001B',
  },
}

export class PurchaseApplyEntity extends AnyDataBaseEntity {
  // 是否验收完成
  acceptComplete?: boolean

  // 申请人ID
  applicantId?: string

  // 填写日期
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
    rangeMap: ['createDateStart', 'createDateEnd'],
  })
  @SearchField()
  @TableField({
    width: 120,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('填写日期')
  declare createDate?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '输入标准物质名称或申请人后回车即可查询',
    isOnlySearch: true,
  })
  @SearchField({ width: '310px' })
  keyword?: string

  @TableField({
    width: 120,
  })
  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('申请人')
  applicantName?: string

  @TableField({
    width: 150,
  })
  @CustomField('申请说明')
  description?: string

  @TableField({
    width: 120,
    sorter: true,
  })
  @CustomField('标准物质种数')
  itemCount?: string

  @TableField({
    width: 120,
    sorter: true,
  })
  @CustomField('总金额(元)')
  totalAmount?: string

  @TableField({
    width: 100,
    fixed: 'right',
    isAlways: true,
  })
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('状态', PurchaseApplyStatusDict)
  status?: EPurchaseApplyStatus

  @CustomField('明细列表')
  applyItems?: PurchaseApplyDetailEntity[]

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 200,
  })
  @CustomField('操作')
  operation?: any
}
