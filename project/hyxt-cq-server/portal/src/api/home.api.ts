import request from "@/config/request.js"
import { EnrollmentConstructorType } from "@/type/api/botSignIn"

// 数据字段
export function getDictCode(code: string) {
  return request({
    url: `/portal/org/dict?code=${code}`,
    method: "get"
  })
}

//  访问量
export function getSysFlowRate() {
  return request({
    url: "/portal/news/flow/rate",
    method: "get"
  })
}

//  首页信息
export function getHomeNoticeList() {
  return request({
    url: "/portal/news/index",
    method: "get"
  })
}
interface parType {
  current: number
  size: number
  title?: string
  type: string
}
// 新闻分页列表
export function getNewsPageList(params: parType) {
  return request({
    url: "/portal/news/page",
    method: "get",
    params
  })
}

// 新闻分页列表
export function getNewsDetail(id: string) {
  return request({
    url: `/portal/news/${id}`,
    method: "get"
  })
}

// 首页地图分布
export function mapDistribution() {
  return request({
    url: "/portal/org/distribution",
    method: "get"
  })
}

interface technicalParType {
  size: number
  current: number
}
// 技术交流-列表
export function technicalPages(params: technicalParType) {
  return request({
    url: "/portal/technical/exchange",
    method: "get",
    params
  })
}
// 技术交流-详情
export function technicalDetail(id: string) {
  return request({
    url: `/portal/technical/exchange/${id}`,
    method: "get"
  })
}

/*---检测报告查询---------------------------------*/
interface reportQeryType {
  orgName: string // 机构名称
  reportSN: string // 报告编号
  queryCode: string // 验证码
}
// 报告查询
export function reportQuery(params: reportQeryType) {
  return request({
    url: `/portal/report/portalQuery`,
    method: "get",
    params
  })
}

// 更正记录查询
// @params
//  id 报告id     count：变更次数
export function changeHistoryApi(id: string, count: number) {
  return request({
    url: `/portal/report/versions/${id}?versionType=AMEND&startVersion=${count}&endVersion=${count + 1}`,
    method: "get"
  })
}

// 获取报告变更记录
// @params
//  id 报告id     count：变更次数
export function getHistoryByVersion(
  id: string,
  versionType?: string,
  startV?: string,
  endV?: string
) {
  return request({
    url: `/portal/report/versions/${id}`,
    method: "get",
    params: {
      startVersion: startV || null,
      endVersion: endV || null,
      versionType: versionType || null
    }
  })
}



// 查询次数
export function queryCountApi(id: string) {
  return request({
    url: `/portal/report/queryRecord/${id}`,
    method: "get"
  })
}

/* ------ 机构业绩查询---------------------------------------*/
// 业绩查询 - 试验室业绩参数
export interface testsType {
  projectName: string // 项目名称
  projectLevel: string //项目等级
  laboratoryCategory: string //实验室类别
  laboratoryName: string //试验室名称
  locatedProvince: string //所在省（市）
  startTime: number //开始时间
  endTime: number //结束时间
  status: string //状态
  external: boolean //市外项目
}
// 业绩查询 - 检测业绩参数
export interface laborType {
  projectName: string //项目名称
  testCategory: string //检测类别
  consignUnit: string //委托单位
  locatedProvince: string //所在省（市）
  startTime: number //检测开始日期
  endTime: number //检测结束日期
  contents: string[] //检测内容
  status: string //状态
  external: boolean //市外项目
}
// // 业绩查询 - 机构业绩参数
export interface orgParType {
  tests: testsType[]
  laboratories: laborType[]
}
// 业绩查询 - 机构业绩查询
export interface orgQueryType {
  orgName: string
  province: string
  city: string
  cityArr?: string[]
}
export function achievementOrg(params: orgQueryType) {
  return request({
    url: `/portal/achievement/org`,
    method: "get",
    params
  })
}

/* ------ 人员业绩查询---------------------------------------*/
// 业绩查询 - 试验室业绩参数
export interface testsPersonType {
  fullName: string // 姓名
  certifyNumber: string // 资格证编号
  projectName: string // 项目名称
  position: string //职务
  consignUnit: string //委托单位
  startTime: number //开始时间
  endTime: number //结束时间
  status: string //状态
  external: boolean //市外项目
}
// 业绩查询 - 检测业绩参数
export interface laborPersonType {
  fullName: string //姓名
  certifyNumber: string //资格证编号
  projectName: string //项目名称
  laboratoryCategory: string //试验室类别
  laboratoryName: string //试验室名称
  position: string //职务
  startTime: number //开始日期
  endTime: number //结束日期
  status: string //状态
  external: boolean //市外项目
}
// // 业绩查询 - 机构业绩参数
export interface personParType {
  tests: testsPersonType[]
  laboratories: laborPersonType[]
}
// 业绩查询 - 人员业绩查询
export interface personQueryType {
  personName: string
  personIdCard: string
}
export function achievementPerson(params: personQueryType) {
  return request({
    url: `/portal/achievement/person`,
    method: "get",
    params
  })
}

// 机构注册验证
interface orgType {
  name: string
}
export function volidOrgnaization(params: orgType) {
  return request({
    url: "/portal/org/name-verify",
    method: "get",
    params
  })
}

interface captchaType {
  phone: string
}
// 获取短信验证码
export function getCaptcha(params: captchaType) {
  return request({
    url: "/portal/org/captcha/send",
    method: "get",
    params
  })
}

// 机构注册
interface fileType {
  name: string
  url: string
}
export interface signinParType {
  orgId: string //机构ID
  orgName?: string //机构名称
  isExternal: boolean //是否市外机构
  applicant: string //申请人
  projectName: string //工程名称
  applicantPhone: string //申请人电话
  laboratoryType: string | null //实验室类型
  laboratoryName: string //实验室名称
  captcha: string //验证码
  attachments: fileType[] //附件
  auditAdmId: string | null // 行管单位id
}
export function orgnaizationSignin(data: signinParType) {
  return request({
    url: "/portal/org/reg",
    method: "post",
    data
  })
}

// 根据机构名称查询保管人信息
export function getKeeperInfo(name: string) {
  return request({
    url: "/portal/org?doesTheAgencyHaveAdminAccount=" + name,
    method: "get"
  })
}

// 获取部平台机构信息
export function getOrgByPart(name: string) {
  return request({
    url: "/portal/org/remote?q=" + name,
    method: "get"
  })
}

// 获取行管单位
export function getAdmOrgList(orgId?: string) {
  return request({
    url: `portal/org/admList?orgId=${orgId || ""}`,
    method: "get"
  })
}

// 获取检测机构
export function getTestOrgList(orgName: string) {
  return request({
    url: `/portal/org/org-set?orgName=${orgName}`,
    method: "get"
  })
}

// 继续教育学时查询 ----------------------------------------
export interface EducationType {
  size?: number
  current?: number
  orgPersonName: string
  idNum: string
  annual?: string
}
export function educationPage(params: EducationType) {
  return request({
    url: "portal/further/education/page",
    method: "get",
    params
  })
}
export function educationTotalHours(params: EducationType) {
  return request({
    url: `portal/further/education/total/hours`,
    method: "get",
    params
  })
}
// 继续教育学时查询 ----------------------------------------

// 建设单位注册 ----------------------------------------
// 注册建设单位获取验证码
export function enrollSms(phone: string) {
  return request({
    url: `/portal/constructors/enroll-sms?phone=${phone}`,
    method: "get"
  })
}
// 根据建设单位名称查询是否已有注册用户
export function checkConstructorUser(name: string) {
  return request({
    url: `/portal/constructors/users?countUserByConstructorName=${name}`,
    method: "get"
  })
}
// 验证手机号是否存在
export function checkConstructorsPhone(phone: string) {
  return request({
    url: `/portal/constructors?doesThePhoneNumberHaveAccount=${phone}`,
    method: "get"
  })
}
// 注册建设单位 - 水运工程
export function enrollmentConstructors(data: EnrollmentConstructorType) {
  return request({
    url: `/portal/constructors/enrollment`,
    method: "post",
    data
  })
}
// 注册公路工程建设单位
export function enrollmentWaterConstructors(data: EnrollmentConstructorType) {
  return request({
    url: `/portal/constructors/enrollment`,
    method: "put",
    data
  })
}
// 监督机构
export function getBureaus(name: string) {
  return request({
    url: `/portal/constructors/bureaus?partialName=${name}`,
    method: "get"
  })
}
// 公路工程项目列表
export function getProjectList(constructor: string, projectName: string) {
  return request({
    url: `/portal/constructors/projects?constructor=${constructor}&projectName=${projectName}`,
    method: "get"
  })
}
// 建设单位注册 ----------------------------------------

export function chackOrgExistAPI(params) {
  return request({
    url: `/portal/org?isTheAgencyRegisteredInTheCreditMarket`,
    method: "get",
    params,
    errorMsg:false
  })
}
