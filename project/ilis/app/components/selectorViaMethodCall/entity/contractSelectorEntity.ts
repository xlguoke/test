import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'

/** 合同状态 */
export enum CONTRACT_STATUS {
  FINISH = '0',
  EXECUTING = '1',
  ENTERING = '2',
  AUDITING = '3',
  AUDIT_NOT_PASS = '4',
}

/** 合同状态字典 */
export const CONTRACE_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  { key: CONTRACT_STATUS.FINISH, label: '合同已完结' },
  { key: CONTRACT_STATUS.EXECUTING, label: '合同执行中' },
  { key: CONTRACT_STATUS.ENTERING, label: '合同录入中' },
  { key: CONTRACT_STATUS.AUDITING, label: '合同审核中' },
  { key: CONTRACT_STATUS.AUDIT_NOT_PASS, label: '审核不通过' },
])

export class ContractSelectorEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入合同名称/编号查询',
  })
  @SearchField()
  @CustomField('快速查询参数')
  quickQryParam?: string

  @TableField()
  @CustomField('合同名称')
  name?: string

  @TableField()
  @CustomField('合同编号')
  code?: string

  @TableField()
  @CustomField('合同状态', CONTRACE_STATUS_DICT)
  status?: string
}
