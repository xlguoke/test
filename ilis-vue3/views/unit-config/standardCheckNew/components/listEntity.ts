import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/** 查新状态 */
export enum CHECKNEW_STATUS {
  /** 未开始 */
  NOT_START = 'NOT_STARTED',
  /** 进行中 */
  PENDING = 'IN_PROGRESS',
  /** 待提交 */
  WAIT_SUBMIT = 'PENDING_SUBMIT',
  /** 审核中 */
  AUDIT = 'UNDER_REVIEW',
  /** 已完成 */
  FINISH = 'COMPLETED',
  /** 未通过 */
  REJECTED = 'NOT_APPROVED',
}

/** 查新状态字典 */
export const CHECKNEW_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  { label: '未开始', key: CHECKNEW_STATUS.NOT_START, color: '#333' },
  { label: '进行中', key: CHECKNEW_STATUS.PENDING, color: '#4B7902' },
  { label: '待提交', key: CHECKNEW_STATUS.WAIT_SUBMIT, color: '#0066ec' },
  { label: '审核中', key: CHECKNEW_STATUS.AUDIT, color: '#F59A23' },
  { label: '已完成', key: CHECKNEW_STATUS.FINISH, color: '#6D000E' },
  { label: '未通过', key: CHECKNEW_STATUS.REJECTED, color: '#D9001B' },
])

/**
 * ## 查新列表
 */
export class StandardCheckNewEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入查新名称查询',
  })
  @SearchField()
  @CustomField('模糊查询')
  q?: string

  @TableField()
  @CustomField('查新名称')
  name?: string

  @TableField()
  @CustomField('查新进度')
  verifiable?: number

  @CustomField('已查新数量')
  verified?: number

  @TableField()
  @CustomField('状态', CHECKNEW_STATUS_DICT)
  status?: CHECKNEW_STATUS

  @TableField()
  @CustomField('创建人')
  declare createName: string

  @TableField({
    sorter: true,
  })
  @CustomField('创建日期')
  declare createDate: Date

  @TableField({
    width: 220,
  })
  @CustomField('操作')
  action?: string
}
