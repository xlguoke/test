import type { ICustomProperties } from '../checkSend/component/customRecord'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * # 自定义检校信息entity（添加过程记录）
 */
export class CustomRecordEntity extends AnyDataBaseEntity {
  @FormField()
  @TableField({ width: 100 })
  @CustomField('检校测试参数')
  detailName?: string

  @FormField()
  @TableField({ width: 100 })
  @CustomField('测试结果')
  testResult?: string

  @FormField()
  @TableField({ width: 100 })
  @CustomField('依据标准')
  standard?: string

  @FormField()
  @TableField({ width: 100 })
  @CustomField('技术要求')
  requirement?: string

  @FormField()
  @TableField({ width: 100 })
  @CustomField('允许偏差')
  allowableDeviation?: string

  @FormField()
  @TableField({ width: 100 })
  @CustomField('校验测试最大偏差')
  testMaxDeviation?: string

  @FormField()
  @TableField({ width: 100 })
  @CustomField('结论')
  conclusion?: string

  customValues?: ICustomProperties[]
}
