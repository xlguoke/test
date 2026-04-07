import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

/** # 掺量entity */
export class MixingAmountEntity extends AnyDataBaseEntity {
  /** 掺量单位 */
  @FormField({ formType: EFormItemType.INPUT })
  @TableField()
  @CustomField('推荐掺量')
  recommendedDosage?: string

  /** 用量kg/m³ */
  @FormField({ formType: EFormItemType.INPUT })
  @TableField()
  @CustomField('用量kg/m³')
  dosage?: string

  /** 单位比 */
  @FormField({ formType: EFormItemType.INPUT })
  @TableField()
  @CustomField('单位比')
  unitRatio?: string

  /** 备注 */
  @FormField({ formType: EFormItemType.INPUT })
  @TableField()
  @CustomField('备注')
  remark?: string
}

/** 编辑掺量信息 */
export class EditMixingAmountEntity extends MixingAmountEntity {
  @TableField()
  @CustomField('样品名称')
  testSampleDisplayName?: string

  /** 规格型号 */
  @TableField()
  @CustomField('规格型号')
  standard?: string
}
