import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
/**
 * # 签字方式
 */
export enum SignMode {
  /** # 电子 */
  ELECTRONIC = 'electronic',
  /** # 图片 */
  PICTURE = 'picture',
  /** # 不签名 */
  NONE = 'none',
}

/**
 * # 签字方式字典
 */
export const SignModeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: SignMode.ELECTRONIC, label: '电子' },
  { key: SignMode.PICTURE, label: '图片' },
  { key: SignMode.NONE, label: '不签名' },
])

export class SignOrderConfigEntity extends AnyDataBaseEntity {
  @CustomField('签字（章）项')
  signTag!: string

  @CustomField('人员类型')
  reportPersonType!: string

  @TableField()
  @CustomField('签字（章）项')
  description!: string

  @TableField()
  @CustomField('签字方式', SignModeDict)
  signMode!: SignMode
}
