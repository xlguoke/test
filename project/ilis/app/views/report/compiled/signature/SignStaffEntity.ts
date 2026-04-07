import type { SignMode } from './SignOrderConfigEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { SignModeDict } from './SignOrderConfigEntity'

/**
 * # 签字（章）项 类型枚举
 * - 0: 报告负责人
 * - 6: 检测人员
 * - 9: 项目负责人
 * - 2: 报告编写
 * - 4: 审核
 * - 5: 批准
 */
export enum SignStaffType {
  /** # 报告负责人 */
  REPORT_PRINCIPAL = '0',
  /** # 检测人员 */
  DETECTION_PERSONNEL = '6',
  /** # 项目负责人 */
  PROJECT_PRINCIPAL = '9',
  /** # 报告编写 */
  REPORT_WRITER = '2',
  /** # 审核 */
  AUDIT = '4',
  /** # 批准 */
  APPROVE = '5',
}

/**
 * # 签字（章）项类型 对应人员查询类型 map
 */
export const SignStaffTypeQueryType = {
  [SignStaffType.REPORT_PRINCIPAL]: '',
  [SignStaffType.DETECTION_PERSONNEL]: '222211',
  [SignStaffType.PROJECT_PRINCIPAL]: '',
  [SignStaffType.REPORT_WRITER]: '',
  [SignStaffType.AUDIT]: '222213',
  [SignStaffType.APPROVE]: '222214',
}

/**
 * # 签名人员信息entity
 */
export class SignStaffEntity extends AnyDataBaseEntity {
  @CustomField('是否必填')
  required?: boolean

  @TableField()
  @CustomField('签字（章）项') // 签字人员类型显示名
  typename?: string

  @CustomField('签字（章）项') // 签字人员类型值
  type!: SignStaffType

  @TableField()
  @CustomField('签字方式', SignModeDict)
  signMode?: SignMode

  @CustomField('签字（章）项') // 签字标签
  signTag?: string

  @TableField({
    customRender: ({ text }: { text: Pick<IUserSelectVoEntity, 'id' | 'name'>[] }) => {
      return text.map(item => item.name).join('、')
    },
  })
  @CustomField('签字人')
  staffname?: IUserSelectVoEntity[]

  @CustomField('是否多选') // 自己挂的属性
  isMultiple?: boolean

  disabled?: boolean

  @TableField()
  @CustomField('操作')
  operation?: any
}
