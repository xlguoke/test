import type { EDataType } from '~/api/unit-config/test-param/enum'
import type { IListValueItem } from '~/api/unit-config/test-param/types'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { DataTypeDict } from '~/api/unit-config/test-param/constant'

export type { IListValueItem }

/**
 * # 参数过程信息实体 📋
 * 对应接口 /test/param/inter 返回的数据结构
 */
export class ParamProcessEntity extends AnyDataBaseEntity {
  /** 检测项目ID */
  testItemId?: string

  /** 检测参数ID */
  testParamId?: string

  /** 系统ID */
  testParamSystemId?: string

  @TableField({ width: 100, fixed: 'left' })
  @FormField({ formType: EFormItemType.INPUT, required: true })
  @SearchField()
  @CustomField('名称')
  name?: string

  @TableField({ width: 100 })
  @FormField({ formType: EFormItemType.SELECT, required: true })
  @CustomField('数据类型', DataTypeDict)
  dataType?: EDataType

  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('下拉列表')
  listValue?: string

  @TableField({ width: 100 })
  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('默认值')
  defaultValue?: string

  @TableField({ width: 80 })
  @FormField({ formType: EFormItemType.INPUT_NUMBER, min: 0 })
  @CustomField('排序号')
  orderNo?: number

  @TableField({ width: 120 })
  @FormField({ formType: EFormItemType.TEXTAREA, maxLength: 500 })
  @CustomField('备注')
  memo?: string

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 80,
  })
  @CustomField('操作')
  action?: any
}
