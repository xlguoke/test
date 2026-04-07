import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'
/**
 * # 检校计划状态枚举 （ "10": "填写中", "20": "审批中", "30": "审批拒绝", "40": "审批通过" ）
 */
export enum CheckPlanStatus {
  WAIT_APPROVE = '10',
  APPROVE_ING = '20',
  APPROVE_REJECT = '30',
  APPROVE_SUCCESS = '40',
}

/**
 * # 检校计划状态字典
 */
export const CheckPlanStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: '10', label: '填写中' },
  { key: '20', label: '审批中' },
  { key: '30', label: '审批拒绝' },
  { key: '40', label: '审批通过' },
])

/**
 * # 检校计划entity
 */
export class EquipmentCheckPlanEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('计划名称')
  name?: string

  @TableField({
    customRender: ({ record }) => {
      return record?.planMouth ? `${record?.planYear}/${record?.planMouth}` : `${record?.planYear}`
    },
  })
  @CustomField('年/月')
  planYear?: string

  @TableField()
  @CustomField('科室')
  planDepartName?: string

  @TableField()
  @CustomField('创建人')
  declare createName: string

  @TableField({
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('创建时间')
  declare createDate: Date

  @TableField()
  @CustomField('计划状态', CheckPlanStatusDict)
  planStatus?: CheckPlanStatus

  @TableField()
  @CustomField('备注')
  remark?: string
}
