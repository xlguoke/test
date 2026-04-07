// 查询
export interface queryParType {
  current: number | undefined
  size: number | undefined
  categoryCode?: string // 采集类型
  projectId?: string //项目id
  labId?: string // 试验室id
  dataType?: string | boolean // 状态
  equSn?: string // 设备编号
}

// 列表
export interface dataItemType {
  id?: string
  categoryCode: string // 采集类型
  laboratoryName: string // 所属试验室
  laboratoryId: string // 所属试验室
  equipmentName: string // 设备名称
  equipmentSn: string // 设备编号
  maker: string // 设备厂家
  model?: string // 规格型号
  location?: string // 位置
  dataType?: string // 状态
  remark?: string // 备注
}

// 删除
export interface delParType {
  id: string
  type: string | null
  m: string
}

/*---检测业绩----------------------*/
// 查询
export interface testQueryParType {
  current: number | undefined
  size: number | undefined
  projectId?: string //项目id
  laboratoryId?: string // 试验室id
  eqSn?: string // 设备编号
  collectTimeStart?: string // 采集开始时间
  collectTimeEnd?: string // 采集结束时间
  deleted?: boolean | null //是否删除
  isQualified?: boolean | null // 是否合格
  date?: any[]
}

// 列表
export interface testDataItemType {
  id?: string
  eqSn: string // 设备编号
  eqModel: string // 规格型号
  collectTime: string // 采集时间
  deleted: boolean // 是否删除
  isQualified: boolean // 是否合格
  eqType: string // 设备类型
  collectType: string // 数据类型
  collectItemId: string // 采集项目ID
}

// 详情
export interface testDEtailType {
  id: string
  eqSn: string // 设备编号
  eqModel: string // 规格型号
  collectTime: string // 采集时间
  deleted: boolean // 是否删除
  isQualified: boolean // 是否合格
  eqType: string // 设备类型
  collectType: string // 数据类型
  collectItemId: string // 采集项目ID
  collectItemCode: string //
  crossSection: string //
  dots: [] // 力学曲线点位
  hz: string[]
  itemNname: string
  laboratoryName: string // 试验室名称
  lq: string
}
