import type { OPTIONS_DATA_SOURCE } from './enum'
import type { ProcessorConfig } from './interface'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { FIELD_SOURCE_DICT, OPTIONS_DATA_SOURCE_DICT } from './constants'

/** 领域列表 */
export class IndustryListEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @SearchField()
  @TableField()
  @CustomField('领域名称')
  name?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
    placeholder: '请输入领域代码（领域代码会用于业务逻辑判断，保存后不可修改）',
  })
  @TableField()
  @CustomField('领域代码')
  code?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('处理程序')
  program?: string

  @FormField({
    formType: EFormItemType.SWITCH,
  })
  @TableField()
  @CustomField('是否启用')
  enabled?: boolean

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
  })
  @CustomField('排序号')
  sort?: number

  @FormField({
    formType: EFormItemType.TEXTAREA,
  })
  @TableField()
  @CustomField('领域描述')
  description?: string

  @CustomField('配置信息 - 模板、动态字段')
  config?: { config: ProcessorConfig, [key: string]: any }

  @TableField({
    isAlways: true,
    width: 180,
    align: 'center',
    fixed: 'right',
  })
  @CustomField('操作')
  actions?: string

  defaulted?: boolean
}

export class BaseConfigEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('名称')
  fieldName?: string

  @TableField()
  @CustomField('显示名称')
  fieldDisplayName?: string

  @TableField()
  @CustomField('属性')
  fieldCode?: string
}

/** 字段配置：通用字段 */
export class CommonConfigEntity extends BaseConfigEntity {
  @TableField()
  @CustomField('字段来源', FIELD_SOURCE_DICT)
  target?: string
}

/** 字段配置：委托布局 */
export class LayoutConfigEntity extends BaseConfigEntity {
  @TableField({
    width: 140,
  })
  @CustomField('表单类型')
  formType?: string

  @TableField()
  @CustomField('数据源', OPTIONS_DATA_SOURCE_DICT)
  dataFrom?: OPTIONS_DATA_SOURCE

  @TableField({
    width: 110,
    align: 'center',
  })
  @CustomField('是否可设置默认值')
  defaulted?: boolean

  @TableField({
    width: 70,
    align: 'center',
  })
  @CustomField('是否必填')
  required?: boolean
}
