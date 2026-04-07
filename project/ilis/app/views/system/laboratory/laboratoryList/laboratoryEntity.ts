import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

export const CUSTOMMIZE_TYPE = 'laboratory'

export class LaboratoryEntity extends AnyDataBaseEntity {
  @TableField({
    width: '70px',
  })
  @CustomField('排序号')
  orderNum?: string

  @TableField()
  @CustomField('功能室名称')
  name?: string

  @TableField()
  @CustomField('基础功能')
  basicFuncDesc?: string

  @TableField()
  @CustomField('是否检测室')
  isLaboratory?: string

  @TableField()
  @CustomField('设备数量')
  equAmount?: string

  @TableField()
  @CustomField('试验室责任人')
  labDutyPerson?: string

  @TableField()
  @CustomField('温度标准')
  minTemperature?: string

  @TableField()
  @CustomField('湿度标准')
  minHumidity?: string

  @TableField()
  @CustomField('备注')
  remark?: string

  @TableField({
    width: '120px',
    fixed: 'right',
    isAlways: true,
  })
  @CustomField('操作')
  operation?: string
}
