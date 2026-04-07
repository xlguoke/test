import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

export class DataCenterEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('系统样品ID')
  sysSampleId?: string

  @TableField()
  @CustomField('系统样品名称')
  sysSampleName?: string

  @TableField()
  @CustomField('系统样品显示名称')
  sysSampleDisplayName?: string

  @TableField()
  @CustomField('系统参数ID')
  sysParamId?: string

  @TableField()
  @CustomField('系统参数名称')
  sysParamName?: string

  @TableField()
  @CustomField('系统参数显示名称')
  sysParamDisplayName?: string

  @TableField()
  @CustomField('系统检测项目ID')
  sysItemId?: string

  @TableField()
  @CustomField('系统检测项目名称')
  sysItemName?: string

  @TableField()
  @CustomField('GROUP_ID')
  groupKey?: string

  @TableField()
  @CustomField('录入模板ID')
  inputTemplateId?: string

  @TableField()
  @CustomField('记录模板ID')
  recordTemplateId?: string

  @TableField()
  @CustomField('报告模板ID')
  reportTemplateId?: string
}
