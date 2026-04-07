import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

enum DICT_SOURCE_FROM {
  /** 用户字典 */
  SYS = '1',
  /** 系统字典 */
  USER = '2',
}

const DICT_SOURCE_FROM_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '用户字典',
    key: DICT_SOURCE_FROM.USER,
  },
  {
    label: '系统字典',
    key: DICT_SOURCE_FROM.SYS,
  },
])

export class DictListEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入字典名称/字典编码查询',
  })
  @SearchField()
  @CustomField('模糊查询')
  q?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('字典名称')
  typegroupname?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField()
  @CustomField('字典编码')
  typegroupcode?: string

  @TableField({
    width: 100,
    align: 'center',
  })
  @CustomField('操作')
  action?: string
}

export class DictDetailEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: '20%',
  })
  @CustomField('类型名称')
  typename?: string

  @FormField({
    formType: EFormItemType.SELECT,
    multiple: true,
  })
  @CustomField('领域')
  industryIds?: string[]

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入类型编码，长度在1-30位字符',
    maxLength: 30,
    required: true,
  })
  @TableField({
    width: '20%',
  })
  @CustomField('类型编码')
  typecode?: string

  @TableField({
    width: 80,
  })
  @CustomField('字典类型', DICT_SOURCE_FROM_DICT)
  sourceFrom?: string

  @FormField({
    formType: EFormItemType.INPUT_NUMBER,
    min: 0,
    required: true,
  })
  @TableField({
    width: 60,
  })
  @CustomField('排序号')
  orderNumber?: number

  @TableField({
    width: 50,
    fixed: 'right',
  })
  @CustomField('操作')
  action?: string
}
