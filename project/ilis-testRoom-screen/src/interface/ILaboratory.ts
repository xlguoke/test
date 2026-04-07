export interface ILaboratory {
  maxTemperature: 23
  minConHum: 20
  showReallyTH: false
  accessControlEquipmentSn: "22222222222222222222"
  iotEqStatus: false
  orderNum: 0
  remark: ""
  minIotHum: 23
  isLaboratory: "1"
  minHumidity: 50
  iotEqId: "56ad82a0-981d-11ef-b7fe-858fb20d75ac"
  maxIotHum: 29
  minTemperature: 10
  id: "2c9120818ab58877018ab5b51bc20026"
  basicFuncDesc: ""
  otherLiabilityPersons: "11111111111111111111"
  overview: "随便写点随便写点随便写点随便写点随便写点"
  maxConHum: 30
  departIds: "2c9284d5767eda4a01768438f1f4009e,2c9284d5767eda4a0176844581390136,2c9284d5767eda4a01768445d823013a,2c9284d5767eda4a017684470345014c,2c9284d5767eda4a01768447d7fb0158"
  labDutyPersonId: "4028b2268a254249018a25649b560052"
  minIotTem: 10
  labDutyPerson: "彭春梅"
  departNames: "科技设备处,综合办公室,财务合同部,技术质量部,道路工程室"
  maxIotTem: 20
  name: "xx室内"
  maxHumidity: 75
  applicableParam: "大萨达是大所多按时啊实打实啊"
  maxConTem: 30
  displayScreenNum: ""
  minConTem: 10
  equAmount: 1
  tem: number
  hum: number
  temStatus: string
  humStatus: string
  [key: string]: any
}

/** 功能室详情接口返回值 */
export interface ILabDataRes {
  info: ILabInfo
  iotEqInfo: { humIotStatus: boolean; temIotStatus: boolean }
  iotEqStatus: boolean
}

/** 功能室信息 */
export interface ILabInfo {
  id: string
  name: string
  type: string
  envLevel: string
  minTemperature: number
  maxTemperature: number
  minHumidity: number
  maxHumidity: number
  showReallyTH: boolean
  minTemCon: number
  maxTemCon: number
  minHumCon: number
  maxHumCon: number
  openTemAuto: string
  openHumAuto: string
  minTemAuto: string
  maxTemAuto: string
  minHumAuto: string
  maxHumAuto: string
  temResMin: string
  humResMin: string
  temValueTake: string
  humValueTake: string
  temEqId: string
  humEqId: string
  iotEqList: ILabIotEq[]
  bookIotEqList: ILabIotEq[]
  labIotEq: ILabIotEq
  remark: string
  overview: string
  otherLiabilityPersons: string
  displayScreenNum: string
  applicableParam: string
  isLaboratory: string
  orderNum: number
  basicFuncDesc: string
  labDutyPerson: string
  labDutyPersonId: string
  equipmentIds: string
  accessControlEquipmentSn: string
  departIds: string
  departNames: string
  positionCode: string
  biddingPersonIds: string
  biddingPersonNames: string
  biddingPersons: IBiddingPerson[]
  temEqConfig: IMEqConfig
  humEqConfig: IMEqConfig
}

export interface IBiddingPerson {
  biddingPersonId: string
  biddingPersonName: string
  phone: string
  jobTitle: string
  tsAttachment?: ITsAttachment
}

export interface ITsAttachment {
  id: string
  unitCode: string
  businessKey: string
  subclassname: string
  attachmenttitle: string
  attachmentcontent: string
  realpath: string
  createDate: Date
  note: string
  swfpath: string
  extend: string
  md5Code: string
  size: number
  uploadWay: string
  uploader: string
  uploadQR: string
  tsuser: ITsuser
}

export interface ITsuser {
  id: string
  unitCode: string
  userName: string
  ssoName: string
  realName: string
  browser: string
  userKey: string
  password: string
  pwdLastUpdateDate: number
  pwdOverdue: boolean
  activitiSync: string
  status: number
  deleteFlag: number
  signature: string
  departid: string
  strength: number
  currentDepart: string
  departmentIds: string
  roleIds: string
  roleCodes: string
  signatureFile: string
  mobilePhone: string
  officePhone: string
  email: string
  createDate: number
  createBy: string
  createName: string
  updateDate: number
  updateBy: string
  updateName: string
  signPhoto: string
  loginTimes: number
  jobTitle: string
  certificateNo: string
  birthDay: number
  iconUrl: string
  signKey: string
  tripartiteUserId: string
  tripartiteType: string
  signKeyEnableTime: string
  signKeyExpireTime: string
  rfid: string
  idCard: string
  authStatus: string
  type: number
  authNo: string
  deedStatus: string
}

export interface ILabIotEq {
  iotEqId: string
  equipmentSn: string
  type: string | string
  ability: string | string
  name: string
  minTem: string
  maxTem: string
  minHum: string
  maxHum: string
}

export interface IMEqConfig {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string
  updateBy: string
  updateDate: string
  unitCode: string
  laboratory: string
  type: string
  minSta: number
  maxSta: number
  minCon: number
  maxCon: number
  minAuto: string
  maxAuto: string
  resMin: string
  valueTake: string
  openAuto: string
  eqId: string
  deleted: string
}
