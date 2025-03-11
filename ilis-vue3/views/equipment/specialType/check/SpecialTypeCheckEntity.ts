import { CustomField } from '~/anyThing/decorator/CustomField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * # 特种设备检查实体
 */
export class SpecialTypeCheckEntity extends AnyDataBaseEntity {
  @SearchField()
  quickQryParam?: string

  @CustomField('设备编号')
  eqSn?: string

  @CustomField('设备名称')
  eqName?: string

  @TableField({
    width: 150,
  })
  @CustomField('检查时间')
  checkTime?: Date

  @CustomField('检查人员')
  checkUser?: string

  @CustomField('检查项目')
  checkItem?: string

  @CustomField('检查结果')
  checkResult?: string

  @CustomField('处理措施')
  measures?: string

  @CustomField('维护建议')
  maintenanceOpinion?: string

  @CustomField('维护和维修记录')
  maintenanceRecord?: string

  @CustomField('备注')
  remark?: string

  @TableField({
    isAlways: true,
    width: 180,
  })
  @CustomField('操作')
  Action?: any
}
