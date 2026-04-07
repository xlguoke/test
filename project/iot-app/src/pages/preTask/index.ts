import type { LaboratoryIotEqType } from '../appointment-management'

export interface IPreTask {
  id: '4028b24293623a6601936252aecc025e'
  testTaskId: '4028b24293623a660193625168bb024c'
  laboratoryId: '2c9120818ab58877018ab5b51bc20026'
  laboratoryName: 'xx室内'
  laboratoryIotEqName: '留样室'
  laboratoryIotEqId: '4028b2f49348b921019348e8e96a0005'
  laboratoryIotEqType: LaboratoryIotEqType
  testTaskCode: 'RW-ZJZ1-0012'
  testSampleDisplayCode: string
  testSampleDisplayName: '硅酸盐水泥'
  paramList: [
    {
      testParamDisplayName: '安定性(代用法)'
      id: string
    },
  ]
  type: 'RES'
  status: 'OPEN'
  restType: 'NO'
  customType: 'CLOSE'
  customValue: null
  startDate: 1732520693000
  endDate: 1732607095000
  tem: 10
  hum: 50
  maxTem: 23
  maxHum: 75
  createName: '管理员'
  resUserName: '管理员'
  resUserId: '8a8ab0b246dc81120146dc8181950052'
  boxName: string
  testParams: string
}
