import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/**
 * # 用户评价状态枚举
 */
export enum EvaluateInvUserStatus {
  /** # 待评价 */
  WAIT = 'OPEN',
  /** # 已评价 */
  FINISH = 'CLOSE',
}

/**
 * # 用户评价状态字典
 */
export const EvaluateInvUserStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: EvaluateInvUserStatus.WAIT,
    label: '待评价',
  },
  {
    key: EvaluateInvUserStatus.FINISH,
    label: '已评价',
  },
])

/**
 * # 邀请用户实体
 */
export class EvaluateInvUserEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入委托单位/姓名/电话查询',
  })
  @SearchField()
  quickQry?: string

  @TableField()
  @CustomField('委托单位')
  consignUnitName?: string

  @TableField()
  @CustomField('姓名')
  sampleSenderName?: string

  @TableField()
  @CustomField('电话')
  contactPhone?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @TableField()
  @CustomField('状态', EvaluateInvUserStatusDict)
  status?: EvaluateInvUserStatus

  @TableField()
  @CustomField('操作')
  operation?: any

  @CustomField('委托单位id（提交用）')
  consignUnitId?: string

  @CustomField('委托人员id（提交用）')
  sampleSenderId?: string
}
