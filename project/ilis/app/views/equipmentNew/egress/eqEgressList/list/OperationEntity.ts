import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'
import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'
import { EDateFormatType } from '~/utils/EDateFormatType'

/** # 外出状态 */
export enum EgressStatus {
  /** 在库 */
  IN_LIBRARY = '10',
  /** 外出待确认 */
  OUTGOING_PENDING = '20',
  /** 外出被拒绝 */
  IN_LIBRARY_30 = '30',
  /** 外出中 */
  OUTGOING = '40',
  /** 归还待确认 */
  RETURN_PENDING = '50',
  /** 归还被拒绝 */
  RETURN_REJECTED = '60',
  /** 外出延期 */
  OUTGOING_DELAY = '70',
  /** 延期待确认 */
  DELAY_PENDING = '80',
  /** 延期被拒绝 */
  DELAY_REJECTED = '90',
  /** 外出转交 */
  OUTGOING_TRANSFER = '100',
  /** 转交待确认 */
  TRANSFER_PENDING = '110',
  /** 转交被拒绝 */
  TRANSFER_REJECTED = '120',
}

/** # 设备外出状态字典 */
export const EgressStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '在库', key: EgressStatus.IN_LIBRARY },
  { label: '外出待确认', key: EgressStatus.OUTGOING_PENDING },
  { label: '外出被拒绝', key: EgressStatus.IN_LIBRARY_30 },
  { label: '外出中', key: EgressStatus.OUTGOING },
  { label: '归还待确认', key: EgressStatus.RETURN_PENDING },
  { label: '归还被拒绝', key: EgressStatus.RETURN_REJECTED },
  { label: '外出延期', key: EgressStatus.OUTGOING_DELAY },
  { label: '延期待确认', key: EgressStatus.DELAY_PENDING },
  { label: '延期被拒绝', key: EgressStatus.DELAY_REJECTED },
  { label: '外出转交', key: EgressStatus.OUTGOING_TRANSFER },
  { label: '转交待确认', key: EgressStatus.TRANSFER_PENDING },
  { label: '转交被拒绝', key: EgressStatus.TRANSFER_REJECTED },
])

/** # 转交申请状态 */
export enum TransitionStatus {
  /** 不存在审核通过的转交申请 */
  NO = 'NO',
  /** 转交申请已创建 */
  CREATE = 'CREATE',
  /** 存在审核通过的转交申请 */
  SUCCESS = 'SUCCESS',
}

/** # 操作记录实体 */
export class OperationEntity extends AnyBaseModel {
  operationType!: EgressStatus

  // 自定义插槽展示
  @FormField()
  @CustomField('接收人')
  receiveUser?: string

  // 自定义插槽展示
  @FormField()
  @CustomField('转交人')
  transitionUser?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('转交时状态', 'eq_status')
  equipmentStatus?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    required: true,
    showTime: true,
  })
  @CustomField('确认时间')
  operationTime?: string

  @FormField()
  @CustomField('备注')
  remark?: string

  // 通过自定义插槽上传附件
  @FormField()
  @CustomField('附件上传')
  qrKey?: string
}
