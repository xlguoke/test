import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/** # 送样类型枚举 */
export enum ESampleSendType {
  /** # 立即送样 */
  Direct = 'IMMEDIATE',
  /** # 预约送样 */
  Appointment = 'APPOINTMENT',
  /** # 自行送样 */
  SELF_DELIVERY = 'SELF_DELIVERY',
}

export enum SampleSendStatus {
  已取消 = '已取消',
  待审核 = '待审核',
  已审核 = '已审核',
  运送中 = '运送中',
  已送达 = '已送达',
  已登记 = '已登记',
  已核实 = '已核实',
  已结案 = '已结案',
}

export enum SampleSendStatusMine {
  /**
   * 已创建
   */
  CREATED = 'CREATED',
  /**
   * 待接收
   */
  PENDING = 'PENDING',
  /**
   * 已接收
   */
  RECEIVED = 'RECEIVED',
  /**
   * 已取消
   */
  CANCELLED = 'CANCELLED',
}

export const SampleSendStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: SampleSendStatus.已取消, label: '已取消' },
  { key: SampleSendStatus.待审核, label: '待审核' },
  { key: SampleSendStatus.已审核, label: '已审核' },
  { key: SampleSendStatus.运送中, label: '运送中' },
  { key: SampleSendStatus.已送达, label: '已送达' },
  { key: SampleSendStatus.已登记, label: '已登记' },
  { key: SampleSendStatus.已核实, label: '已核实' },
  { key: SampleSendStatus.已结案, label: '已结案' },
])

/** # 送样类型字典 */
export const ESampleSendTypeDict = AnyDictionaryHelper.createDictionaryArray([
  { key: ESampleSendType.Direct, label: '立即送样（机器人送样）' },
  { key: ESampleSendType.Appointment, label: '预约送样（机器人送样）' },
  { key: ESampleSendType.SELF_DELIVERY, label: '自行送样（人工自取）' },
])

export class SampleSendEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入任务编号/样品名称/样品编号',
  })
  @SearchField()
  @CustomField('快捷查询')
  q?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField()
  @CustomField('送样状态', SampleSendStatusDict)
  samplingStatus?: SampleSendStatus

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('送样任务编号')
  samplingTaskCode?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('操作人')
  operator?: string

  @FormField({ formType: EFormItemType.RADIO, required: true })
  @TableField({ width: 200 })
  @CustomField('送样类型', ESampleSendTypeDict)
  taskType = ESampleSendType.Appointment

  // @FormField({
  //   formType: EFormItemType.INPUT_SELECTOR,
  //   required: true,
  //   selectorConfig: {
  //     selectorView: TaskSelector,
  //     payload: async () => {
  //       return {
  //         type: 1,
  //         queryScope: 'user',
  //         dataType: 1,
  //       }
  //     },
  //     onSelect: (value: TaskEntity[], formData: SampleSendEntity) => {
  //       formData.taskCode = value[0].testTaskCode
  //       formData.objectName = value[0].testSampleDisplayName
  //       formData.objectCode = value[0].testObjectCode
  //       formData.taskId = value[0].id
  //     },
  //   },
  // })
  // @TableField()
  // @CustomField('任务编号')
  // taskCode?: string

  // taskId?: string

  // @FormField({ formType: EFormItemType.INPUT, disabled: true })
  // @TableField()
  // @CustomField('样品名称')
  // objectName?: string

  // @FormField({ formType: EFormItemType.INPUT, disabled: true })
  // @TableField()
  // @CustomField('样品编号')
  // objectCode?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('功能室')
  labId?: string

  @TableField()
  @CustomField('功能室')
  labName?: string

  @TableField()
  @CustomField('目的地编号', 'lab::position')
  positionCode?: string

  @FormField({
    formType: EFormItemType.DATE,
    required: true,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    showTime: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
    sorter: true,
  })
  @CustomField('要求送达时间')
  // 默认第二天早上8点
  requestDeliveryTime = AnyDateTimeHelper.format(new Date(new Date().setHours(24 + 8, 0, 0, 0)), EDateFormatType.YYYY_MM_DD_HH_MM_SS)

  @FormField({
    formType: EFormItemType.SWITCH,
  })
  @CustomField('是否预约功能室温湿度')
  appointmentTemperatureAndHumidity = false

  // 搜索用字段
  @FormField({
    formType: EFormItemType.DATE_RANGE,
    isOnlySearch: true,
    dateFormat: EDateFormatType.YYYY_MM_DD_HH_MM_SS,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('要求送达时间')
  requestDeliveryTimeSearch?: Date

  @TableField()
  @CustomField('送样状态', SampleSendStatusDict)
  samplingTaskStatus?: string

  status?: SampleSendStatusMine

  @TableField({ isAlways: true })
  @CustomField('操作')
  operation?: any
}
