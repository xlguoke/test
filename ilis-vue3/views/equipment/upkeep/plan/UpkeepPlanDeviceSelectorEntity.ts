import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 设备保养计划设备选择器实体
 */
export class UpkeepPlanDeviceSelectorEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('所属部门')
  departId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('设备名称/设备编号')
  quickQuery?: string

  @TableField()
  @CustomField('设备名称')
  name?: string

  @TableField()
  @CustomField('设备编号')
  equipment_sn?: string

  @TableField()
  @CustomField('规格型号')
  standard?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('购置日期')
  buyDate?: string

  @TableField({
    customRender: ({ record }: { record: UpkeepPlanDeviceSelectorEntity }) => {
      const start = AnyDateTimeHelper.format(Number(record.upkeepTime) || '', EDateFormatType.YYYY_MM_DD)
      const end = AnyDateTimeHelper.format(Number(record.upkeepTimeEnd) || '', EDateFormatType.YYYY_MM_DD)

      if (start && end) {
        return `${start}~${end}`
      }
      else {
        return start
      }
    },
  })
  @CustomField('上次保养日期')
  upkeepTime?: string

  upkeepTimeEnd?: string

  @TableField()
  @CustomField('所属部门')
  departname?: string
}
