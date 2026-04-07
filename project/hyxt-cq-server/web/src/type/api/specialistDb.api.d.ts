import dayjs from "dayjs"
export interface queryParType {
  current: number | undefined
  size: number | undefined
  water?: string[]
  highway?: string[]
  status?: string | null
  q?: string
}

export interface majorType {
  id?: string
  expertId?: string //专家id
  category: string //所属大类
  code: string //专业code
  major: string // 专业name
}

export interface dataItemType {
  id?: string
  orgId: string //所属机构ID
  orgName: string //所属机构名称
  name: string //专家名称
  idCard: string //专家身份证号
  sort: number | null //排序
  province: string //省（市）
  city: string //市（区）
  sex: string //性别
  birthday?: string | null //生日
  educational?: string //学历
  duty: string //职务
  professional?: string //职称
  tel?: string //电话
  phone?: string //手机
  email?: string //邮箱
  address?: string //地址
  postcode?: string //邮编
  certNo?: string //检测证书编号
  remark?: string //备注
  expertLevel?: string | null //专家级别
  highwayDeclare?: string //申请公路专业
  waterDeclare?: string //申请水运专业
  leader?: boolean //是否担任过组长
  status?: string //状态 - FREE-未选择，BUSY-已选择，INELIGIBLE-已删除
  highway?: majorType[] //公路专业具体信息
  water?: majorType[] //水运专业具体信息
  provinceArr?: string[] // 前端临时变量
}

/*---活动列表----------------*/
export interface actQueryParType {
  current: number | undefined
  size: number | undefined
  q?: string
  status?: string | null
}

interface majorsType {
  category: string
  code: string
  major: string
}
// 专家列表
export interface expertsType {
  expertId: string // 专家id
  leader: boolean // 是否担任过组长
  name?: string // 名称
  idCard?: string // 身份证号
  duty?: string // 职务
  professional?: string // 职称
  tel?: string //电话
  phone?: string // 手机
  participate: boolean // 是否同意
  participateRemark: string // 备注
}
// 新增活动
export interface actDataItemType {
  id?: string //活动ID
  name: string //活动名称
  org: string //活动单位
  address: string //活动地址
  startTime: number | null //开始时间
  endTime: number | null //结束时间
  status?: string | null // 活动状态（UNCOMPLETED-待开始，COMPLETED-已结束）
  leaderNumber: number //组长人数
  memberNumber: number //组员人数
  leaders: string //组长
  members: string //组员,
  remark?: string //活动备注
  scored?: boolean //是否已经评分
  avoidOrg?: { orgId: string; orgName: string }[] // 回避单位
  majors?: majorsType[] // 抽取专家选择专业
  experts: expertsType[] //抽取的专家
  date?: dayjs[] // 前端临时变量-起止日期
}

// 抽取专家限制条件
export interface recordParType {
  leaderNumber: number | null
  memberNumber: number | null
  activityId?: string | null
  avoidOrg: { orgId: string; orgName: string }[]
  majors: majorsType[]
  startTime?: number | null
  endTime?: number | null
}

// 专家活动记录检查
export interface checkType {
  expertIds: string
  startTime: string
  endTime: string
  activityId?: string | null
}

// 评价
export interface evaluationType {
  id: string // 专家id
  score: string // 评分
  scoreRemark: string // 评分备注
}
