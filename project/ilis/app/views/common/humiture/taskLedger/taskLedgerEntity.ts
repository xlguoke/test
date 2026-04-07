import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { allLaboratoryApi } from './api'

/** 状态 */
export enum STATUS {
  /** 正常 */
  NORMAL = 0,
  /** 异常 */
  ABNORMAL = 1,
  /** 其他 */
  OTHER = 2,
}

export const STATUS_DICT = AnyDictionaryHelper.createDictionaryArray([
  {
    label: '正常',
    key: STATUS.NORMAL,
  },
  {
    label: '异常',
    key: STATUS.ABNORMAL,
  },
  {
    label: '--',
    key: STATUS.OTHER,
  },
])

/** 列表 */
export class ListEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入任务编号、委托编号、报告编号、样品编号、记录编号、样品名称查询',
  })
  @SearchField({
    width: '500px',
  })
  @CustomField('模糊查询')
  quickQry?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @CustomField('所属部门')
  departId?: string

  @TableField()
  @CustomField('任务编号')
  testTaskCode?: string

  @TableField()
  @CustomField('样品编号')
  testObjectCode?: string

  @TableField()
  @CustomField('记录编号')
  testRecordCode?: string

  @TableField({
    width: 220,
  })
  @CustomField('报告编号')
  reportNumber?: string

  @TableField()
  @CustomField('所属部门')
  department?: string

  @TableField()
  @CustomField('样品名称')
  sampleName?: string

  @TableField()
  @CustomField('检测人员')
  taskUser?: string

  @TableField()
  @CustomField('检测时间')
  testTime?: string

  @TableField()
  @CustomField('工程部位/用途')
  projectPartAndUse?: string

  @TableField({
    fixed: 'right',
    width: 80,
  })
  @CustomField('操作')
  action?: string
}

/** 详情 */
export class LedgerRecordEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('功能室')
  name?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField()
  @TableField()
  @CustomField('检测参数')
  paramName?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @CustomField('功能室', allLaboratoryApi)
  labId?: string

  // 最低温度
  @TableField()
  @CustomField('标准温度（℃）')
  minTemperature?: number

  @CustomField('最高温度')
  maxTemperature?: number

  @TableField()
  @CustomField('温度（℃）')
  tem?: number

  // 最低湿度
  @TableField()
  @CustomField('标准湿度（%rh）')
  minHumidity?: number

  @CustomField('最高湿度')
  maxHumidity?: number

  @TableField()
  @CustomField('湿度（%rh）')
  hum?: number

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField()
  @TableField()
  @CustomField('状态', STATUS_DICT)
  status?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    showTime: true,
  })
  @SearchField({
    width: '320px',
  })
  @CustomField('时间')
  timeRange?: string[]

  @TableField()
  @CustomField('时间')
  recordTime?: number
}
