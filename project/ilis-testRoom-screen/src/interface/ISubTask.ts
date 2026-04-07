import { SubTaskStatus } from "@/views/functionRoom2/view/taskDetail"

export interface ISubTask {
  id: "469280819481b6f9019481d9ac6c0003"
  testTaskId: "2c939b5f7d74a63a017db2aa735f72bc"
  testObjectId: "2c939b5f7d74a63a017db2aa6f057289"
  testObjectParamId: "2c939b5f7d74a63a017db2aa6f05728c"
  testObjectParamDisplayName: "路基"
  startTime: "2025-01-20 11:55:14"
  endTime: null
  status: SubTaskStatus
  eqList: any[]
  houseHumMax?: number
  houseHumMin?: number
  houseTemMax?: number
  houseTemMin?: number
  /** 前端加的字段 */
  temHumOverState?: string
  checkHumOver?: {
    mark?: "LAB" | "PARAM"
    standardMinTem?: number //标准最低温度
    standardMaxTem?: number //标准最高温度
    standardMinHum?: number //标准最低湿度
    standardMaxHum?: number //标准最高湿度
  }
}
