import type { EquipmentCheckParamEntity } from '../../check/param/EquipmentCheckParamEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import VMCallParamsSelector from '~/components/selectorViaMethodCall/VMCallParamsSelector.vue'
import VMCallPersonSelector from '~/components/selectorViaMethodCall/VMCallPersonSelector.vue'
import { EDateFormatType } from '~/utils/EDateFormatType'
import TimeSelector from './component/TimeSelector.vue'
import { EquipmentInspectTimeEntity } from './EquipmentInspectTimeEntity'

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
 * # 设备核查计划设备明细实体
 */
export class EquipmentInspectDeviceEntity extends AnyDataBaseEntity {
  @TableField({ width: 100 })
  @CustomField('设备名称')
  name?: string

  @TableField({ width: 100 })
  @CustomField('设备编号')
  equipmentSn?: string

  equipmentId?: string

  @TableField({ width: 100 })
  @CustomField('规格型号')
  standard?: string

  @TableField({ width: 100 })
  @CustomField('所属部门')
  departName?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('前次检校时间')
  preCheckDate?: Date

  @TableField({ width: 100 })
  @CustomField('检校周期')
  checkPeriod?: Date

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('计划检校时间')
  nextCheckDate?: Date

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    required: true,
    selectorConfig: {
      selectorView: TimeSelector,
      onSelect: (val: EquipmentInspectTimeEntity[], formData) => {
        formData.inspectTimes = val.map(item => item.time).join(';')
      },
      checkedRows: async (formData: EquipmentInspectDeviceEntity) => {
        const times = formData.inspectTimes?.split(';')
        return EquipmentInspectTimeEntity.fromJsonArray(times?.map((item, index) => {
          return {
            id: `${Date.now}${index}`,
            time: item,
          }
        }) || [])
      },
    },
  })
  @TableField({ width: 160, fixed: 'right' })
  @CustomField('期间核查时间')
  inspectTimes?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    required: true,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      onSelect: (val: IUserSelectVoEntity[], formData) => {
        formData.inspectUserId = val[0]?.id
        formData.inspectUserName = val[0]?.name
      },
    },
  })
  @TableField({ width: 160, fixed: 'right' })
  @CustomField('核查人')
  inspectUserName?: string

  inspectUserId?: string

  @FormField()
  @TableField({ width: 100, fixed: 'right' })
  @CustomField('核查方式')
  inspectWay?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: VMCallParamsSelector,
      multiple: false,
      payload: async (formData: EquipmentInspectDeviceEntity) => {
        return { objId: formData.equipmentId }
      },
      onSelect: (val: EquipmentCheckParamEntity[], formData) => {
        formData.inspectItems = val?.[0]?.name
        formData.inspectItemId = val?.[0]?.id
      },
      checkedRows: async (formData: EquipmentInspectDeviceEntity) => {
        return formData.inspectItemId ? [{ id: formData.inspectItemId, name: formData.inspectItems }] : []
      },
    },
  })
  @TableField({ width: 160, fixed: 'right' })
  @CustomField('核查参数')
  inspectItems?: string

  inspectItemId?: string

  @FormField()
  @TableField({ width: 100, fixed: 'right' })
  @CustomField('核查依据')
  verificationBasis?: string

  @FormField()
  @TableField({ width: 100, fixed: 'right' })
  @CustomField('测量参考标准名称及精度')
  referenceStandards?: string

  @FormField()
  @TableField({ width: 100, fixed: 'right' })
  @CustomField('备注')
  remark?: string

  @TableField({
    isAlways: true,
    width: 100,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any
}
