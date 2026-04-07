import { Dayjs } from "dayjs"

export interface queryParType {
  current: number | undefined
  size: number | undefined
  orgId?: string
  q?: string // 机构名称
  projectLevel?: string | null // 项目级别
  external?: boolean | null // 是否为市外项目
}

export interface filesType {
  id?: string
  name: string
  url: string
  uid?: string | number
  size?: string | number
  type?: string
}

//  人员列表
export interface personnelType {
  id?: string
  personId: string // id
  name: string // 姓名
  idCard: string // 身份证号
  position: string // 职务
  achievementDescription: string // 业绩描述
  entranceTime: string | number // 任职开始时间
  leaveTime: string | number // 任职结束时间
  date?: [Dayjs, Dayjs] | null //任职时间
}

// 数据列表
export interface dataItemType {
  id?: string
  projectType: string | null
  technicalLevel: string //技术等级
  orgId: string //机构ID
  orgName: string //机构名称
  projectName: string //项目名称
  projectLevel: string //项目等级
  locatedProvince: string //省（市）
  locatedCity: string //市（区）
  external: boolean //是否为市外项目
  laboratoryName: string //试验室室名称
  startTime: string | number //开始时间
  endTime: string | number //结束时间
  laboratoryCategory: string | null //试验室类型
  laboratoryHead: string //试验室负责人
  important: boolean //是否为重点项目
  status?: string
  persons: personnelType[] // 人员信息
  attachments: filesType[] // 证明材料
  date?: Dayjs[] // 起止时间-前端临时存储
  provinceCity?: strign[] // 省市-前端临时存储
  auditUnitId?: string // 审核机构
}

/* ---- 申报承诺书 ----------------------- */
export interface commitmentQueryType {
  current: number | undefined
  size: number | undefined
  orgName?: string // 机构名称
  projectType?: string | null // 工程类型
  levelType?: string | null // 等级类型
}

export interface commitmentListType {
  id?: string
  orgId: string
  url: string
  has: string
  orgName: string
  orgProvince: string
  orgCity: string
  orgNature: string
  qualify: string
  certNo: string
}

/*------ 试验业绩列表 ----------------------------*/

export interface contentType {
  id?: string
  itemId: string // 项目id
  majors: string // 专业
  classification: string // 分类
  content: string // 内容
  rowSpan1?: number
  rowSpan2?: number
}
export interface testDataItemType {
  projectType: string //工程类型
  id?: string
  orgId: string //机构ID
  orgName: string //机构名称
  projectName: string //项目名称
  projectConstructionManagementUnit?: string // 项目建设管理单位
  locatedProvince: string //省（市）
  locatedCity: string //市（区）
  external: boolean //是否为市外项目
  lotNo: string // 标段号
  testCategory: string //委托类型
  consignUnit: string //委托人名称
  contractName: string // 合同名称
  contractAmount: number // 合同价
  startTimeOfContract: string | number // 合同履行开始时间
  endTimeOfContract: string | number // 合同履行结束时间
  technicalGrade: string // 技术等级
  settlementAmount: number // 结算价
  jointAchievement: string // 联合体业绩
  contractMainContent: string // 主要合同内容
  // startTime: string | number //检测开始时间
  // endTime: string | number //检测结束时间
  persons: personnelType[] // 人员信息
  contents: contentType[] //内容
  attachments: filesType[] // 附件
  auditUnitId: string // 审核机构
  status?: string // 状态
  // date?: Dayjs[] // 检测时间-前端临时存储
  provinceCity?: string[] // 省市-前端临时存储
}
