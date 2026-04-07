import { AnyDictionaryHelper } from "@/utils/Dictionary/DictionaryHelper"

/**
 * 设备进行任务数据实体
 */
const taskData = {
  id: "",
  testTaskCode: "RW-2022-GLZH-0427",
  testObjectCode: "YP-2022-GLZH-FMH-022",
  testSampleName: null,
  testSampleDisplayName: "拌制混凝土和砂浆用粉煤灰",
  requireReportDate: null,
  testUser: "江志英,李华兰,董琴",
  taskStart: 1700459328000,
  taskEndPredict: null || 1700459328000,
  testTaskParams: null,
  testTaskParamDisplayNames: null
}

export type TaskEntity = typeof taskData

/**
 * 维修状态枚举
 */
export enum MaintanceStatusEnum {
  /** 状态:填写中 */
  STATUS_INPUT_ING = "10",
  /** 状态:填写完成,审批不通过也退回到这里 */
  STATUS_INPUT_COMPLETE = "20",
  /** 状态:维修信息审批中 */
  STATUS_REPAIR_AUDITING = "30",
  /** 状态:维修中(审批通过) */
  STATUS_REPAIR_ING = "40",
  /** 状态:维修完成,结果验证不通过也退回这里 */
  STATUS_REPAIR_COMPLETE = "50",
  /** 状态:结果验证审批中 */
  STATUS_VERIFY_AUDITING = "60",
  /** 状态:验证审批完成 */
  STATUS_VERIFY_COMPLETE = "70"
}

/**
 * 维修状态字典
 */
export const MaintanceStatusDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: MaintanceStatusEnum.STATUS_INPUT_ING,
    label: "填写中"
  },
  {
    key: MaintanceStatusEnum.STATUS_INPUT_COMPLETE,
    label: "填写完成"
  },
  {
    key: MaintanceStatusEnum.STATUS_REPAIR_AUDITING,
    label: "维修信息审批中"
  },
  {
    key: MaintanceStatusEnum.STATUS_REPAIR_ING,
    label: "维修中"
  },
  {
    key: MaintanceStatusEnum.STATUS_REPAIR_COMPLETE,
    label: "维修完成"
  },
  {
    key: MaintanceStatusEnum.STATUS_VERIFY_AUDITING,
    label: "结果验证审批中"
  },
  {
    key: MaintanceStatusEnum.STATUS_VERIFY_COMPLETE,
    label: "验证审批完成"
  }
])

export interface MaintanceEntity {
  id: string
  createBy: string
  createDate: Date
  equipmentId?: string
  equipmentName?: string
  repairServiceEndTime?: Date
  repairSn?: string
  phenomenon?: string
  reason?: string
  disposeWay?: string
  remark?: string
  status?: MaintanceStatusEnum
  totalFee?: number | undefined // 或者使用 TypeScript 的 `BigDecimal` 类型，如果有的话
}

/**
 * 功能室实体
 */
export interface RoomEntity {
  /**
   * 功能室id
   */
  id?: string

  /**
   * 功能室名称
   */
  name?: string

  /**
   * 门禁设备编号
   */
  accessControlEquipmentSn?: string

  /**
   * 显示屏编号
   */
  displayScreenNum?: string

  /**
   * 适用参数
   */
  applicableParam?: string

  /**
   * 最低温度
   */
  minTemperature?: number

  /**
   * 最高温度
   */
  maxTemperature?: number

  /**
   * 温度
   */
  temperature?: number

  /**
   * 最低湿度
   */
  minHumidity?: number

  /**
   * 最高湿度
   */
  maxHumidity?: number

  /**
   * 湿度
   */
  humidity?: number

  /**
   * 展示真实温湿度, TRUE: 展示设备采集的真实温湿度, FALSE: 展示设定的标准温湿度
   */
  showReallyTH?: boolean

  /**
   * 试验室负责人
   */
  labDutyPerson?: string

  /**
   * 试验室负责人id
   */
  labDutyPersonId?: string

  /**
   * 试验人员id
   */
  testUserId?: string

  /**
   * 试验人员
   */
  testUser?: string

  /**
   * 功能室状态
   */
  status?: LaboratoryStatus

  /**
   * 功能室概况
   */
  overview?: string

  /**
   * 其他责任人信息
   */
  otherLiabilityPersons?: string

  /**
   * 头像地址
   */
  iconUrl?: string
}

export enum LaboratoryStatus {}

const inOutRecordData = {
  EventId: null,
  PhotoUrl: null,
  PersonName: "访客",
  GenderStr: null,
  UnitName: null,
  ProjectName: null,
  Phone: null,
  EventTime: "2024-07-30T15:08:57",
  Status: "在岗",
  Temp: "-",
  OverTemp: null,
  EventScreenshotUrl: "",
  Remarks: ""
}

export type InOutRecordEntity = typeof inOutRecordData
