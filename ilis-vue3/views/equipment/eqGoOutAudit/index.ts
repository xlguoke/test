import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyDictionaryHelper } from '~/anyThing/helper/AnyDictionaryHelper'
import { EDateFormatType } from '~/utils/EDateFormatType'

export { default as EqGoOutAudit } from './Index.vue'

export const CUSTOMIZE_TYPE = 'eq-egress'

export enum EGRESS_APPLY_STATUS {
  /** 待提交 */
  SUBMIT = '12',
  /** 审批中 */
  AUDIT = '14',
  /** 审批拒绝 */
  NOT_PASS = '16',
  /** 审批通过 */
  PASS = '20',
}

export const EGRESS_APPLY_STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  { label: '待提交', key: EGRESS_APPLY_STATUS.SUBMIT },
  { label: '审批中', key: EGRESS_APPLY_STATUS.AUDIT },
  { label: '审批拒绝', key: EGRESS_APPLY_STATUS.NOT_PASS },
  { label: '审批通过', key: EGRESS_APPLY_STATUS.PASS },
])

export class EqGoOutAuditEntity extends AnyDataBaseEntity {
  @TableField({
    width: 50,
  })
  @CustomField('标识')
  tag?: string

  @TableField()
  @CustomField('外出申请单号')
  egressApplySn?: string

  @TableField()
  @CustomField('工程项目')
  projectName?: string

  @TableField()
  @CustomField('任务编号')
  testTaskSn?: string

  @TableField({
    width: '10%',
    ellipsis: true,
  })
  @CustomField('设备')
  equipmentName?: string

  @TableField()
  @CustomField('借用人')
  borrowUser?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField()
  @TableField()
  @CustomField('申请时间')
  declare createDate: Date

  @TableField()
  @CustomField('外出时间')
  egressTime?: string

  @FormField()
  @TableField()
  @CustomField('预还时间')
  expectReturnTime?: string

  @TableField()
  @CustomField('备注')
  remark?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @TableField()
  @CustomField('申请状态', EGRESS_APPLY_STATUS_DICT)
  applyStatus?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('申请状态', EGRESS_APPLY_STATUS_DICT)
  status?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('查询项')
  q?: string

  @TableField()
  @CustomField('操作')
  options?: string
}
