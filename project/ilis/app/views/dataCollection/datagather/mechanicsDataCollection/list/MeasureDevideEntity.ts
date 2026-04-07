import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export class MeasureDevideEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    width: '420px',
  })
  @CustomField('请输入设备名称/设备编号/样品编号/任务编号/记录编号查询')
  q?: string

  @TableField()
  @CustomField('样品编号')
  testObjectCode?: string

  @TableField()
  @CustomField('设备编号')
  equipmentSn?: string

  @TableField()
  @CustomField('设备名称')
  equipmentName?: string

  @TableField()
  @CustomField('任务编号')
  testTaskCode?: string

  @TableField()
  @CustomField('记录编号')
  testRecordCode?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['measureTimeStart', 'measureTimeEnd'],
  })
  @SearchField()
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
  })
  @CustomField('检测时间')
  measureTime?: number
}
