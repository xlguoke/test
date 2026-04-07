import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
/**
 * # 设备租借类型枚举
 */
export enum EquipmentRentType {
  /** # 对外出租(出借) */
  OUT_RENT = '1',
  /** # 租借外部设备 */
  OUT_BORROW = '2',
  /** # 内部借用 */
  INNER_BORROW = '3',
}

/**
 * # 设备租借字典
 */
export const EquipmentRentTypeDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: EquipmentRentType.OUT_RENT,
    label: '对外出租(出借)',
  },
  {
    key: EquipmentRentType.OUT_BORROW,
    label: '租借外部设备',
  },
  {
    key: EquipmentRentType.INNER_BORROW,
    label: '内部借用',
  },
])

/**
 * # 设备租借状态枚举
 */
export enum EquipmentRentStatus {
  /** # 填写中  */
  WAIT_APPROVE = '10',
  /** # 审批中  */
  APPROVE_ING = '20',
  /** # 审批拒绝  */
  APPROVE_REJECT = '30',
  /** # 审批通过  */
  APPROVE_SUCCESS = '40',
  /** # 申请被驳回  */
  APPROVE_FAIL = '50',
  /** # 已归还  */
  RETURNED = '60',
}

/**
 * # 设备租借状态字典
 */
export const EquipmentRentStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: EquipmentRentStatus.WAIT_APPROVE,
    label: '填写中',
  },
  {
    key: EquipmentRentStatus.APPROVE_ING,
    label: '审批中',
  },
  {
    key: EquipmentRentStatus.APPROVE_REJECT,
    label: '审批拒绝',
  },
  {
    key: EquipmentRentStatus.APPROVE_SUCCESS,
    label: '审批通过',
  },
  {
    key: EquipmentRentStatus.APPROVE_FAIL,
    label: '申请被驳回',
  },
  {
    key: EquipmentRentStatus.RETURNED,
    label: '已归还',
  },
])

/** 借用签字状态枚举  */
export enum EquipmentRentSignStatus {
  /** # 借用待签字 */
  NO_RENT = 'NO_RENT',
  /** # 借用签字完成 */
  RENT = 'RENT',
  /** # 归还待签字 */
  NO_RETURN = 'NO_RETURN',
  /** # 归还签字完成 */
  RETURN = 'RETURN',
}

/**
 * # 设备借用实体
 * 正常来说应该要继承自设备实体的，但是现在没有设备实体，先直接以VO来写😎
 */
export class EquipmentRentEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入设备编号、设备名称',
  })
  @SearchField()
  @CustomField('查询内容')
  quickQryParam?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('设备编号')
  equipmentSn?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('设备状态', 'eq_status')
  rentEqStatus?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('设备名称')
  equipmentName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('设备规格')
  eqStandard?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('设备单价')
  equipmentPrice?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('租赁开始日期')
  rentStartTime?: Date

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('租赁结束日期')
  rentEndTime?: Date

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('实际归还日期')
  returnTime?: Date

  @FormField()
  @CustomField('双方协议内容')
  agreementContent?: string

  @FormField({
    formType: EFormItemType.RADIO,
  })
  @TableField()
  @CustomField('借用类型', EquipmentRentTypeDict)
  rentType = EquipmentRentType.OUT_RENT

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('借用类型', EquipmentRentTypeDict)
  /** 搜索用 */
  type?: EquipmentRentType

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('借用时间')
  /** 搜索用 */
  commonDate?: Date[]

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('借出部门(单位)')
  outOrg?: string

  @TableField()@FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('借入部门(单位)')
  inOrg?: string

  @FormField()
  @TableField()
  @CustomField('申请说明')
  applyReason?: string

  @FormField()
  @CustomField('备注')
  remark?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('申请时间')
  declare createDate: Date

  @TableField()
  @CustomField('申请人')
  declare createName: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('申请人')
  /** 搜索用 */
  userName?: string

  @TableField({
    customRender: ({ text, record }: { text: string, record: EquipmentRentEntity }) => {
      if (record.applyStatus === EquipmentRentStatus.WAIT_APPROVE && !record.signerStatus) {
        return '填写中'
      }
      if (record.applyStatus === EquipmentRentStatus.WAIT_APPROVE && record.signerStatus === EquipmentRentSignStatus.RENT) {
        return '签字待提交'
      }
      if ((record.applyStatus === EquipmentRentStatus.WAIT_APPROVE
        || record.applyStatus === EquipmentRentStatus.APPROVE_REJECT
        || record.applyStatus === EquipmentRentStatus.APPROVE_FAIL
      ) && record.signerStatus === EquipmentRentSignStatus.NO_RENT) {
        return '借用待签字'
      }
      if (record.applyStatus === EquipmentRentStatus.APPROVE_SUCCESS && record.signerStatus === EquipmentRentSignStatus.NO_RETURN) {
        return '归还待签字'
      }

      return EquipmentRentStatusDict.getLabelByKey(text)
    },
  })
  @CustomField('状态', EquipmentRentStatusDict)
  applyStatus!: EquipmentRentStatus

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('借出联系人')
  outOrgContacts?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('借入联系人')
  inOrgContacts?: string

  outOrgContactsId?: string
  inOrgContactsId?: string
  outOrgId?: string
  inOrgId?: string
  attachmentIds?: string
  files?: any
  returnId?: string
  equipmentId?: string
  keyId!: string

  signerStatus?: EquipmentRentSignStatus
  rentSignerFile?: any
  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
