//项目查询
export interface ProjectsQueryParams {
  current: number | undefined //当前页
  size: number | undefined //页大小
  name?: string // 项目名称
  status?: string // 状态
  projectId?: string //项目id
}

//工地试验室编辑基本信息
export interface LaboratoryEditBaseParams {
  classification: string //类型
  amend?: boolean //是否是申请或延期
  name: string // 试验室名称
  projectId: string // 选择的工程项目ID
  projectName: string //选择的工程项目名称
  type?: string //试验室类型, 中心试验室/工地试验室
  consignUnit?: string //委托单位
  auxiliaryCount?: number // 辅助人员人数
  status?: string //服务状态,
  testerCount?: number //检测工程师人数
  address?: string //区域地址, 省市区三级
  addressDetail?: string //详细地址
  tel?: string //联系电话
  orgId: string //机构id
  id?: string //试验室id
  keepDateStart: number | string //备案开始日期
  keepDateEnd?: number | string //备案结束日期
  seniorProfessionalCount: string //高级职称人数
  floorArea: string //占地总面积
  fax?: string //传真
  postalCode?: string //邮编
  email?: string //E-mail
  assistantCount?: number //助理工程师证人数
  supervise: string | null //监督机构
  superviseId: string | null //监督机构id

  // superviseLinkmanId: string //监督联系人id
  // superviseLinkman: string //监督联系人

  // management?: string //监管单位
  // managementId?: string //监管单位ID
  // principalQuality?: string //质量负责人
  // principalTechnical?: string //技术负责人
  // principal?: string //授权负责人
  // establishDate?: number | string //设立日期
  // backoutDate?: number | string //(拟)撤销日期)
  // onPriorityProject: boolean //是否属于重点项目
  // contractPart?: string //合同段名称
}
export interface LaboratoryEditPersonParams {
  laboratoryId: string //工地试验室id
  personId: string //人员id
  entranceTime: number //加入时间
  name: string //姓名
}

export interface StandardEqT {
  //标准设备 数据类型
  bzEquipment: string
  bzEquipmentId: string
}

export interface EditLabEquipmentParams {
  id?: string //设备id
  sn: string //设备编号
  name: string //设备名称
  lastCalibrationDate: number | string //上次检校日期
  calibrationExpireDate: number | string //检校到期日期
  manufacturer: string //	生产厂家
  specification: string //规格型号
  location: string //安装位置
  remark: string //备注
  laboratoryId?: string //试验室ID
  attachments: Array //附件集合

  measuringRange: string //量程或规格
  calibrationUnit: string //检定校准单位
  calibrationCycle: number //检定周期
  buyDate: number | string //购置日期
  price: number //单价
  accuracy: string //精度
  custodian: string //保管人
  bzEquipments: StandardEqT[]
}

export interface LaboratoryQueryParams {
  current: number | undefined //当前页
  size: number | undefined //页大小
  name?: string // 项目名称
  status?: string // 状态
  projectId?: string //项目id
  projectName?: string //项目名称
  classification: string //类型
}

//工地试验室基本信息变更参数类型
export interface LaboratoryChangesBaseParams {
  laboratoryId: string //试验室id
  reason: string //变更原因
  type: string //变更类型
  details?: [] //基本信息变更详细
  persons?: [] //人员变更详细
  attachments?: [] //变更附件
}
