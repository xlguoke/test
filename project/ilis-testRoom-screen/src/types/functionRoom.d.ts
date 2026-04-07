export interface LabBiddingPersonDTO {
  biddingPersonId: string
  biddingPersonName: string
  phone: string
  jobTitle: string
  tsAttachment: {
    id: string
    attachmenttitle: string
    realpath: string
  }
}
export interface LabInfoDTO {
  id: string // 功能室id
  name: string // 功能室名称
  displayScreenNum: string // 显示屏编号
  applicableParam: string // 适用参数
  temperature: number | string // 温度
  minTemperature?: number // 最小温度
  maxTemperature?: number // 最大温度
  humidity: number | string // 湿度
  minHumidity?: number // 最小湿度
  maxHumidity?: number // 最大湿度
  labDutyPerson: string // 试验室负责人
  labDutyPersonId: string // 试验室负责人id
  departIds?: string // 部门id
  departNames?: string // 部门名称
  testUser?: string
  overview?: string
  status: string // 状态
  iconUrl: string[] // 头像
  testTaskRecord: Array<any>
  otherLiabilityPersons?: string
  showReallyTH: boolean
  biddingPersons: LabBiddingPersonDTO[]
}
