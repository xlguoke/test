import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 软件授权状态枚举
 */
export enum SoftwareAuthStatus {
  /** # 有效 */
  VALID = 'VALID',
  /** # 已过期 */
  EXPIRED = 'EXPIRED',
}

/**
 * # 软件授权状态字典
 */
export const SoftwareAuthStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: SoftwareAuthStatus.VALID, label: '有效' },
  { key: SoftwareAuthStatus.EXPIRED, label: '已过期' },
])

/**
 * # 软件启停状态枚举
 */
export enum SoftwareStatus {
  /** # 启用 */
  OPEN = 'OPEN',
  /** # 停用 */
  CLOSE = 'CLOSE',
}

/**
 * # 软件启停状态字典
 */
export const SoftwareStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: SoftwareStatus.OPEN, label: '启用' },
  { key: SoftwareStatus.CLOSE, label: '停用' },
])

/**
 * # 软件entity
 */
export class SoftwareEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入软件名称/供应商/联系人',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQry?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('软件名称')
  name?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @TableField()
  @CustomField('供应商')
  supplierId?: string

  /** 供应商名称 */
  supplierName?: string

  /** 供应商联系人 */
  contacts?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('采购日期')
  buyDate?: Date

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @TableField()
  @CustomField('授权类型', 'software_type')
  type?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @TableField()
  @CustomField('授权范围', 'software_range')
  range?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('授权开始日期')
  startDate?: Date

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    customRender: ({ text, record }) => {
      if (record.type === 'long') {
        return '永久'
      }
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  })
  @CustomField('授权到期日期')
  endDate?: Date

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    disabled: true,
  })
  @TableField({
    customRender: ({ text, record }) => {
      if (record.type === 'long') {
        return '永久'
      }
      if (text || text === 0) {
        return `${text}天`
      }
    },
  })
  @CustomField('授权持续时间')
  duration?: string

  @FormField({
    formType: EFormItemType.SELECT,
    disabled: true,
  })
  @TableField({
    customRender: ({ record }) => {
      if (record.type === 'long') {
        return SoftwareAuthStatusDict.getLabelByKey(SoftwareAuthStatus.VALID)
      }
      if (!record.startDate || !record.endDate) {
        return
      }
      if (record.startDate > record.endDate || AnyDateTimeHelper.format(Date.now(), EDateFormatType.YYYY_MM_DD) > AnyDateTimeHelper.format(record.endDate, EDateFormatType.YYYY_MM_DD)) {
        return SoftwareAuthStatusDict.getLabelByKey(SoftwareAuthStatus.EXPIRED)
      }
      else {
        return SoftwareAuthStatusDict.getLabelByKey(SoftwareAuthStatus.VALID)
      }
    },
  })
  @CustomField('授权状态', SoftwareAuthStatusDict)
  authStatus?: SoftwareAuthStatus

  @TableField()
  @CustomField('启停状态', SoftwareStatusDict)
  status?: SoftwareStatus

  @FormField({
    formType: EFormItemType.TEXTAREA,
  })
  @TableField()
  @CustomField('备注')
  remark?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    disabled: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('更新日期')
  declare updateDate: Date

  customizeValueStr?: string
  customizeValues?: any
  uploadQR?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
