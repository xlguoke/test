import { number } from "echarts"

export interface queryParType {
  current: number | undefined
  size: number | undefined
  orgName?: string
  projectType?: string | null
  levelType?: string | null
}

export interface orgInfoType {
  id: string
  name: string // 机构名称
  orgNature: string // 机构性质
  address: string // 机构地址
  otherAddress: object // 地址信息
  legalPerson: string //法定代表人
  certHolder: number //持证总人数
  engineerHolder: number //持师总人数
  qualify: [] // 证书人员列表
  province: string // 省
  city: string // 市
  levelType?: string //等级类型
  linkman?: string // 联系人
  phone?: string // 联系手机
  tel?: string // 联系电话
  fax?: string // 传真
  postalCode?: string // 邮政编码
  email?: string // 邮箱
  website?: string // 网址
  bank: string // 开户银行
  bankAccount: string //开户银行账号
  setUpTime: string // 成立时间
  registeredCapital: string // 注册资本
  businessLicenseExpirationDate: string // 营业执照有效期至
  businessLicenseRegistrationNumber: string // 营业执照注册号
  businessLicenseImages?: string | null // 营业执照图片
  introduction: string // 简介
  description?: string // 备注
  status: string // 状态 UNREGISTERED-未注册，NORMAL-正常，LOGOUT-注销，LOGOUT_APP-注销申请中
}
export interface personType {
  certNum: string
  person1: string
  person2: string
  person3: string
}

// 行管接口参数类型 -----------------------
// 查询列表
export interface QueryAdmListType {
  q?: string
  current: number | undefined
  size: number | undefined
}
// 详情
export interface AdmInfoType {
  id?: string // 行管机构ID
  name: string
  provinceCity?: string[] | undefined // 省市，前端使用，不保存到后端
  province: string
  city: string
  address: string // 联系地址
  contact: string // 联系人
  // tel: string // 联系电话
  phone: string // 联系手机

  grade: string | null //等级
  type: string | null //类型
}

// 行管管理的机构
// export interface AdmRelationType {
//   admId: string
//   admName: string
//   orgId: string
//   orgName: string
//   checked: boolean
// }
export interface AdmRelationType {
  id: string
  name: string
  supervised: boolean
}
