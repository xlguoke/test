import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/** # 模板类型 */
export enum ScreenTemplateType {
  /** # 展示屏 */
  DISPLAY_SYSTEM = 'DISPLAY_SYSTEM',
  /** # 操作屏 */
  OPERATING_SYSTEM = 'OPERATING_SYSTEM',
}

export const ScreenTemplateTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '展示屏', key: ScreenTemplateType.DISPLAY_SYSTEM },
  { label: '操作屏', key: ScreenTemplateType.OPERATING_SYSTEM },
])

/**
 * # 智慧屏模板管理entity
 */
export class ScreenTemplateEntity extends AnyDataBaseEntity {
  @FormField({ formType: EFormItemType.SELECT, required: true })
  @SearchField()
  @TableField()
  @CustomField('屏幕类型', ScreenTemplateTypeDict)
  systemType?: ScreenTemplateType

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入模板名称',
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQry?: string

  @FormField({ formType: EFormItemType.INPUT, required: true })
  @TableField()
  @CustomField('模板名称')
  name?: string

  @TableField({ dateFormat: EDateFormatType.YYYY_MM_DD })
  @CustomField('创建时间')
  declare createDate: Date

  @TableField()
  @CustomField('创建人')
  declare createName: string

  /** 模板地址(对应授权屏访问路由) */
  url?: string
  /** 绑定类型（功能室/设备/无） */
  bindType?: string
  /** 是否可配置（老模板不能配置，新模板可以配置） */
  configurable?: boolean
  /** 模板配置数据 */
  metadata?: string

  @TableField({
    isAlways: true,
    width: 160,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any
}
