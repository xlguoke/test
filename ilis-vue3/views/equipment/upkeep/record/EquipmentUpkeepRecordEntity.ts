import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import OrgSelector from '~/components/selectorViaMethodCall/OrgSelector.vue'
import PersonSelector from '~/components/selectorViaMethodCall/PersonSelector.vue'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 设备保养登记状态枚举（待保养，已保养）
 */
export enum EquipmentUpkeepRecordStatus {
  /** # 待保养 */
  WAIT_UPKEEP = '1',
  /** # 已保养 */
  UPKEEPED = '2',
}

/**
 * # 设备保养登记状态字典
 */
export const EquipmentUpkeepRecordStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentUpkeepRecordStatus.WAIT_UPKEEP, label: '待保养', color: '#0066ec' },
  { key: EquipmentUpkeepRecordStatus.UPKEEPED, label: '已保养', color: '#70b603' },
])

/**
 * # 设备保养登记来源类型枚举（计划，设备）
 */
export enum EquipmentUpkeepRecordType {
  /** # 计划 */
  PLAN = '1',
  /** # 设备 */
  EQUIPMENT = '2',
}

/**
 * # 设备保养登记来源类型字典
 */
export const EquipmentUpkeepRecordTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentUpkeepRecordType.PLAN, label: '保养计划' },
  { key: EquipmentUpkeepRecordType.EQUIPMENT, label: '新建保养' },
])

/**
 * # 设备保养登记entity
 */
export class EquipmentUpkeepRecordEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('设备名称/设备编号/保养单号')
  quickQryParam?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('保养部门')
  departId?: string

  @TableField()
  @CustomField('保养单号')
  upkeepSn?: string

  @TableField()
  @CustomField('保养来源')
  upkeepPlanSn?: string

  @CustomField('保养来源', EquipmentUpkeepRecordTypeDict)
  type = EquipmentUpkeepRecordType.EQUIPMENT

  @TableField()
  @CustomField('设备名称')
  name?: string

  @TableField()
  @CustomField('设备编号')
  equipmentSn?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField()
  @CustomField('状态', EquipmentUpkeepRecordStatusDict)
  status?: EquipmentUpkeepRecordStatus

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
  @TableField()
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
  @TableField()
  @CustomField('保养人')
  upkeepPerson?: string

  upkeepPersonId?: string

  @TableField({
    customRender: ({ record }: { record: EquipmentUpkeepRecordEntity }) => {
      return record.upkeepProjectName
    },
  })
  @CustomField('保养项目', 'eqUpkeepProject')
  upkeepProject?: string

  upkeepProjectName?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @SearchField()
  @CustomField('保养日期')
  // 搜索/编辑用
  commonDate?: any

  @TableField({
    sorter: true,
    customRender: ({ record }: { record: EquipmentUpkeepRecordEntity }) => {
      if (record.upkeepTime && record.upkeepTimeEnd) {
        return `${AnyDateTimeHelper.format(record.upkeepTime, EDateFormatType.YYYY_MM_DD)} ~ ${AnyDateTimeHelper.format(record.upkeepTimeEnd, EDateFormatType.YYYY_MM_DD)}`
      }
      else {
        return ''
      }
    },
  })
  @CustomField('保养日期')
  upkeepTime?: string

  upkeepTimeEnd?: string

  equipmentId?: string

  upkeepPlanId?: string

  @FormField()
  @CustomField('备注')
  remark?: string

  @TableField({
    isAlways: true,
  })
  @CustomField('操作')
  operation?: any
}
