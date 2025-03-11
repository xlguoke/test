import type { SignaturePerson } from './api'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { AnyDictionaryHelper } from '~/anyThing/helper/AnyDictionaryHelper'

export { default as OnlineSginature } from './Index.vue'
export { default as OnlineSginatureModal } from './IndexModal.vue'

/**
 * 签字类型
 */
export enum SIGN_TYPE {
  /** 手写板 */
  HAND_WRITE = '1',
  /** 二维码 */
  QR_CODE = '2',
  /** 短信 */
  SMS = '3',
}

export const SIGN_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: SIGN_TYPE.HAND_WRITE,
    label: '手写板',
  },
  {
    key: SIGN_TYPE.QR_CODE,
    label: '二维码',
  },
  {
    key: SIGN_TYPE.SMS,
    label: '短信',
  },
])

// 委托方签字类型
export enum CONSIGN_SIGN_TYPE {
  /** 委托人 */
  CONSIGN = 'CONSIGN',
  /** 监理单位见证人 */
  SUPERVISING = 'SUPERVISING',
  /** 建设单位见证人 */
  BUILD = 'BUILD',
}

export const CONSIGN_SIGN_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: CONSIGN_SIGN_TYPE.CONSIGN,
    label: '委托单位联系人',
  },
  {
    key: CONSIGN_SIGN_TYPE.SUPERVISING,
    label: '监理单位见证人',
  },
  {
    key: CONSIGN_SIGN_TYPE.BUILD,
    label: '建设单位见证人',
  },
])

/**
 * 委托签字人员列表
 */
export class ConsignUserEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('签字类型')
  identity?: string

  @TableField()
  @CustomField('姓名')
  name?: string

  @TableField()
  @CustomField('电话')
  phone?: string

  @TableField({
    width: 80,
  })
  @CustomField('签字状态')
  signed?: boolean
}

// 报告领取签字类型
export enum REPORT_SIGN_TYPE {
  /** 当前报告-委托人 */
  CURRENT = 'CURRENT_SAMPLE_SENDER',
  /** 同委托单位-委托人 */
  OTHER = 'OTHER_SAMPLE_SENDER',
}

export const REPORT_SIGN_TYPE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: REPORT_SIGN_TYPE.CURRENT,
    label: '当前报告-委托人',
  },
  {
    key: REPORT_SIGN_TYPE.OTHER,
    label: '同委托单位-委托人',
  },
])

/**
 * 在线签字人员列表
 */
export class OnlineUserEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('人员身份', REPORT_SIGN_TYPE_DICT)
  identity?: string

  @TableField()
  @CustomField('姓名')
  name?: string

  @TableField()
  @CustomField('电话')
  phone?: string
}

/**
 * 签字来源
 */
export enum SIGNATURE_SOURCE {
  /** 委托方签字 */
  CONSIGN = 'c',
  /** 报告领取签字 */
  REPORT = 'r',
}

export const SIGNATURE_SOURCE_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    key: SIGNATURE_SOURCE.CONSIGN,
    label: '委托方签字',
  },
  {
    key: SIGNATURE_SOURCE.REPORT,
    label: '报告领取签字',
  },
])

/**
 * 组件参数
 */
export interface PropsData {
  dataId: string
  source?: SIGNATURE_SOURCE
  title?: string
}

export interface SignatureData {
  users: SignaturePerson[]
  signType: SIGN_TYPE
}
