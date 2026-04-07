/**
 * 是否物联网设备
 */
export enum IsIot {
  YES = "1",
  NO = "0"
}

/**
 * 是否为公路水运系统相关设备
 */
export enum IsGlsy {
  YES = "1",
  NO = "0"
}

const detailEntityData = {
  id: "2c91208188f1bf320188f1d93422017c",
  sysCompanyCode: "A03",
  createName: "管理员",
  createBy: "admin",
  createDate: 1687684724000,
  updateName: "管理员",
  updateBy: "admin",
  updateDate: 1721879251000,
  name: "微机控制电液伺服万能试验机",
  equipmentSn: "GC-J-004",
  archiveSn: "GC-J-004",
  assetSn: "GC-J-004",
  testManageSn: "",
  standard: "WAW-1000",
  eqRange: "力值示值误差（0-1000kN)",
  accuracy: "0.5级",
  size: "",
  keeperId: "8a8ab0b246dc81120146dc8181950052",
  keeperName: "管理员",
  userId: "",
  userName: "",
  managerId: "",
  managerName: "",
  unitName: "重庆市交通规划和技术发展中心",
  departId: "8a8ab0b246dc81120146dc8180ba0017",
  departName: null,
  storageSite: "",
  laboratoryId: "",
  laboratoryName: "",
  status: "正常",
  rentStatus: "0",
  egressStatus: "10",
  type: "通用设备",
  manageType: "检测仪器-固定资产",
  checkType: "比对",
  checkPeriod: 10,
  checkPeriodUnit: "月",
  preCheckDate: null,
  nextCheckDate: null,
  checkUnit: "泸州市市场检验检测中心",
  checkCertificateSn: "",
  checkCertificateFile: null,
  instructionsForUseFile: null,
  quantity: null,
  netValue: "",
  power: "",
  coefficientMachine: "",
  coefficientElectronic: "",
  coefficientHot: "",
  supplierName: "",
  supplierTel: "",
  buyDate: 1403049600000,
  operationDate: null,
  repairServiceEndTime: null,
  factory: "上海华龙测试仪器股份有限公司",
  factorySupportTel: "",
  factorySn: "18628",
  factoryPrice: 148000,
  productionDate: null,
  transportFee: null,
  installFee: null,
  depreciationFee: null,
  managementWay: "Ⅱ-2类",
  isIot: IsIot.YES,
  isGlsy: IsGlsy.YES,
  isDeleted: "0",
  transferStatus: "10",
  transferRecordId: "402882c18ac9fde3018aca54386e0155",
  serveLocation: "要求完成时间-gai",
  serveLocationId: "1503919121136488448",
  serveLocationType: "20",
  remark: "/",
  orderNum: 0,
  labRangeType: "不限",
  preCheckResult: null,
  biddingCustomizeValueEntities: null,
  columnInChooseEntities: null
}
const paramEntityData = {
  id: "a9f642f557e6651d857359616dfa009d",
  bigCategory: "公路综合甲级--水泥混凝土、砂浆--砂浆--硬化",
  testItemName: "净浆强度试验_JTG F50-2011",
  name: "抗压强度",
  displayName: "抗压强度",
  remark: "F50-2011",
  sort: "1--4--2--2",
  paramSort: "100"
}
export type DeviceDetailEntity = typeof detailEntityData
export type DeviceParamEntity = typeof paramEntityData
