import type { LaboratoryDataEntity } from '~/api/laboratory.ts'
import type { MStatus } from '~/views/common/humiture/record'

export { default as Main } from './Main.vue'

// 控制类型
export enum IotControllType {
  温度 = 'tem',
  湿度 = 'hum',
  所有 = 'all',
}

export enum IotStatusType {
  开 = 1,
  关 = 0,
}

// 界面用数据对象，增加了几个字段
export interface ViewLaboratoryDataEntity extends LaboratoryDataEntity {
  /** 当前温度值 */
  tem?: number
  /** 当前湿度值 */
  hum?: number
  /** 温度状态 */
  temStatus?: MStatus
  /** 湿度状态 */
  humStatus?: MStatus

  /** 巡查时间 */
  recordDate?: string

  // 索引ID
  index?: number
}
