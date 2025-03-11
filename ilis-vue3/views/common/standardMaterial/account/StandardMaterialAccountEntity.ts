import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * 出入库类型
 */
export enum STANDARD_MATERIAL_ACCOUNT_TYPE {
  /** 采购记录 */
  PURCHASE = 'PURCHASE',
  /** 内容更新 */
  CONTENT_UPDATE = 'CONTENT_UPDATE',
  /** 新增入库 */
  NEW_INVENTORY = 'NEW_INVENTORY',
  /** 增加库存 */
  ADD_INVENTORY = 'ADD_INVENTORY',
  /** 减少库存 */
  DECREASE_INVENTORY = 'DECREASE_INVENTORY',
  /** 借阅 */
  CHECK_OUT = 'CHECK_OUT',
  /** 领用 */
  PICK_UP = 'PICK_UP',
  /** 还回 */
  RETURN_BACK = 'RETURN_BACK',
}

export const STANDARD_MATERIAL_ACCOUNT_TYPE_DOCT = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '采购记录',
    key: STANDARD_MATERIAL_ACCOUNT_TYPE.PURCHASE,
  },
  {
    label: '内容更新',
    key: STANDARD_MATERIAL_ACCOUNT_TYPE.CONTENT_UPDATE,
  },
  {
    label: '新增入库',
    key: STANDARD_MATERIAL_ACCOUNT_TYPE.NEW_INVENTORY,
  },
  {
    label: '增加库存',
    key: STANDARD_MATERIAL_ACCOUNT_TYPE.ADD_INVENTORY,
  },
  {
    label: '减少库存',
    key: STANDARD_MATERIAL_ACCOUNT_TYPE.DECREASE_INVENTORY,
  },
  {
    label: '借阅',
    key: STANDARD_MATERIAL_ACCOUNT_TYPE.CHECK_OUT,
  },
  {
    label: '领用',
    key: STANDARD_MATERIAL_ACCOUNT_TYPE.PICK_UP,
  },
  {
    label: '还回',
    key: STANDARD_MATERIAL_ACCOUNT_TYPE.RETURN_BACK,
  },
])

/**
 * # 规程资料出入库台账实体
 */
export class StandardMaterialAccountEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('规程名称')
  bookName?: string

  @TableField()
  @CustomField('颁布号')
  publishCode?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField()
  @CustomField('出入库类型', STANDARD_MATERIAL_ACCOUNT_TYPE_DOCT)
  type?: string

  @TableField()
  @CustomField('数量')
  amount?: string

  @TableField()
  @CustomField('库存剩余')
  inventory?: string

  @TableField()
  @CustomField('人员')
  operator?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('日期')
  dateRange?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    sorter: true,
  })
  @CustomField('时间')
  declare createDate: Date

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入规程名称/颁布号',
    isOnlySearch: true,
  })
  @SearchField()
  quickQry?: string
}
