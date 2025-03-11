import { CheckSendStatusDict } from '../equipment/check/checkSend'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

export class EquipmentInventoryPlanEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('检校单位或登记人员')
  quickQryParam?: string

  @TableField()
  @CustomField('送检批号')
  batchNumber?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('登记时间')
  declare createDate: Date

  @TableField()
  @CustomField('登记人员')
  declare createName: string

  @TableField()
  @CustomField('检校单位')
  declare unit: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField()
  @CustomField('送检日期')
  sendTime?: Date

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('计划取回日期')
  planRetrieveTime?: Date

  @TableField()
  @CustomField('送检说明')
  declare remark: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('送检确认日期')
  sendConfirmTime?: Date

  @TableField()
  @CustomField('状态', CheckSendStatusDict)
  status?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
