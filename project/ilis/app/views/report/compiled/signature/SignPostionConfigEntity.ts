import type { SignStaffType } from './SignStaffEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * # 签名位置配置实体
 */
export class SignPostionConfigEntity extends AnyDataBaseEntity {
  @CustomField('页码')
  pageNo!: number

  @CustomField('签字类型标记')
  tag!: string

  @CustomField('x轴')
  signX!: number

  @CustomField('y轴')
  signY!: number

  @CustomField('签字宽度')
  signWidth!: number

  @CustomField('签字高度')
  signHeight!: number

  @CustomField('顺序')
  index!: number

  @CustomField('文件id')
  attachmentId?: string

  @CustomField('是否当前项')
  isTarget?: boolean

  @CustomField('人员名称')
  userName?: string

  @CustomField('人员id')
  userId?: string

  @CustomField('签字人员类型')
  type?: SignStaffType
}
