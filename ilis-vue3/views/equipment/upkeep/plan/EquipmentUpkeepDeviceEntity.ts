import type { DeviceEntity } from '../../DeviceEntity'
import { UpkeepPlanDeviceSelectorEntity } from './UpkeepPlanDeviceSelectorEntity'
import UpkeepPlanProjectSelector from './component/UpkeepPlanProjectSelector.vue'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import OrgSelector from '~/components/selectorViaMethodCall/OrgSelector.vue'
import PersonSelector from '~/components/selectorViaMethodCall/PersonSelector.vue'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import type { IDictByBackend } from '~/interface/IDictByBackend'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'

/**
 * # 保养周期枚举
 */
export enum PlanPeriod {
  /** # 1个月 */
  ONE_MONTH = 1,
  /** # 2个月 */
  TWO_MONTH = 2,
  /** # 3个月 */
  THREE_MONTH = 3,
  /** # 4个月 */
  FOUR_MONTH = 4,
  /** # 6个月 */
  SIX_MONTH = 6,
  /** # 12个月 */
  TWELVE_MONTH = 12,
}

/**
 * # 保养周期字典
 */
export const PlanPeriodDict = AnyDictionaryHelper.createDictionaryArray([
  { key: PlanPeriod.ONE_MONTH, label: '1' },
  { key: PlanPeriod.TWO_MONTH, label: '2' },
  { key: PlanPeriod.THREE_MONTH, label: '3' },
  { key: PlanPeriod.FOUR_MONTH, label: '4' },
  { key: PlanPeriod.SIX_MONTH, label: '6' },
  { key: PlanPeriod.TWELVE_MONTH, label: '12' },
])

/**
 * # 设备保养计划设备明细实体
 */
export class EquipmentUpkeepDeviceEntity extends UpkeepPlanDeviceSelectorEntity {
  @TableField({
    width: 100,
  })
  @CustomField('设备名称')
  declare name?: string

  @TableField({
    width: 100,
  })
  @CustomField('设备编号')
  declare equipment_sn?: string

  @TableField({
    width: 100,
  })
  @CustomField('规格型号')
  declare standard?: string

  @TableField({
    width: 100,
  })
  @CustomField('所属部门')
  declare departname?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    required: true,
    selectorConfig: {
      selectorView: OrgSelector,
      onSelect: (val: IDepartmentEntity[], formData) => {
        formData.upkeepDepartId = val[0]?.id
        formData.upkeepDepart = val[0]?.text
      },
    },
  })
  @TableField({
    width: 200,
  })
  @CustomField('保养部门')
  upkeepDepart?: string

  upkeepDepartId?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    required: true,
    selectorConfig: {
      selectorView: PersonSelector,
      onSelect: (val: IUserSelectVoEntity[], formData) => {
        formData.upkeepPersonId = val[0]?.id
        formData.upkeepPerson = val[0]?.name
      },
    },
  })
  @TableField({
    width: 160,
  })
  @CustomField('保养人')
  upkeepPerson?: string

  upkeepPersonId?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    required: true,
    selectorConfig: {
      selectorView: UpkeepPlanProjectSelector,
      multiple: true,
      checkedRows: async (formData: EquipmentUpkeepDeviceEntity) => {
        return EquipmentUpkeepDeviceEntity.getOptions('upkeepProjectName')
          ?.filter(item => formData.upkeepProject
            ?.split(',')
            ?.includes(item.value as string),
          )
          ?.map((item) => {
            return {
              typeName: item.label,
              typeCode: item.value,
            }
          }) || []
      },
      onSelect: (val: IDictByBackend[], formData) => {
        formData.upkeepProject = val.map(item => item?.typeCode)?.join(',')
        formData.upkeepProjectName = val.map(item => item?.typeName)?.join(',')
      },
    },
  })
  @TableField({
    width: 200,
  })
  @CustomField('保养项目', 'eqUpkeepProject')
  upkeepProjectName?: string

  upkeepProject?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @TableField({
    width: 140,
  })
  @CustomField('保养周期（月）', PlanPeriodDict)
  planPeriod?: string

  @TableField({
    width: 100,
    customRender: ({ record }: { record: EquipmentUpkeepDeviceEntity }) => {
      return `${record.recordCount}/${record.totalCount}`
    },
  })
  @CustomField('计划进度')
  recordCount!: string

  totalCount!: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField({
    width: 200,
  })
  @CustomField('备注')
  remark?: string

  equipmentId?: string
  equipmentVo?: DeviceEntity
  disabled?: boolean
}
