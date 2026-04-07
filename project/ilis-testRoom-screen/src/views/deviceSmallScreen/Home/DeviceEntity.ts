const entityData = {
  id: "2c91208188f1bf320188f1d93422017c",
  name: "微机控制电液伺服万能试验机",
  equipmentSn: "GC-J-004",
  standard: "WAW-1000",
  eqRange: "力值示值误差（0-1000kN)",
  accuracy: "0.5级",
  keeperName: "管理员",
  preCheckDate: 1717225815000,
  nextCheckDate: 1721891424000,
  factory: "上海华龙测试仪器股份有限公司",
  factorySupportTel: "",
  status: "正常" as StatusType,
  statusDesc: "",
  statusHappenTime: null
}
export type StatusType = "正常" | "已停用" | "正在维修" | "已报废" | "报废留用"

// 返回mock数据的类型
export type DeviceEntity = typeof entityData
