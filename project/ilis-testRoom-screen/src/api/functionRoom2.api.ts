import { SampleStorageRoomQueryParams, VERSION } from "@/types/functionRoome2"
import request from "@/utils/request.js"

export function authApiTransform(api: string) {
  if ((window as any).authToken) {
    return api.replace("api", "rest")
  }
  return api
}

/**
 * # 获取自定义资料卡 - 自定义组件
 */
export function getCustomLabTemplate(params) {
  return request({
    url: "/rest/laboratoryScreenController/custom/all",
    method: "get",
    params
  })
}

/**
 * # 获取试验室详情
 */
export function getLabDetail(id: string) {
  return request({
    url: `/api/indoor-screen/lab/${id}`,
    method: "get"
  })
}

/**
 * # 获取试验室任务列表
 */
export function getLabTaskPage(query: Record<string, any>) {
  return request({
    url: authApiTransform(`/api/indoor-screen/task/pages`),
    method: "get",
    params: query
  })
}

/**
 * # 获取送样任务分页列表
 */
export function getSampleSendTaskPage(query: Record<string, any>) {
  return request({
    url: authApiTransform(`/api/intelligent/sampling/pagination`),
    method: "get",
    params: query
  })
}
/**
 * # 获取任务下的送样任务列表（不分页）
 */
export function getSampleSendTaskByTestTask(query: { taskId: string; labId: string }) {
  return request({
    url: `/api/intelligent/sampling/list`,
    method: "get",
    params: query
  })
}

/**
 * # 查询任务下全部子试验
 */
export function getLabSubTask(taskId: string) {
  return request({
    url: `/api/indoor-screen/test/${taskId}`,
    method: "get"
  })
}

/**
 * # 查询任务关联的收样参数集合, 含规程
 */
export function getLabSubTaskParam(taskId: string) {
  return request({
    url: `/api/indoor-screen/task/param/${taskId}`,
    method: "get"
  })
}

/**
 * # 查询参数使用设备
 */
export function getParamsUsedDeviceList(testTaskId: string, testObjectParamId: string) {
  return request({
    url: `/api/indoor-screen/use/eq`,
    method: "get",
    params: { testTaskId, testObjectParamId: testObjectParamId }
  })
}

/**
 * # 启动一个子试验
 */
export function startLabSubTask(labId: string, taskId: string, data: Record<string, any>[]) {
  return request({
    url: authApiTransform(`/api/indoor-screen/test/start/${labId}/${taskId}`),
    method: "post",
    data
  })
}

/**
 * # 完成一个子试验
 */
export function endLabSubTask(labId: string, id: string) {
  return request({
    url: authApiTransform(`/api/indoor-screen/test/end/${labId}/${id}`),
    method: "get"
  })
}

/**
 * # 批量完成子试验
 */
export function endLabSubTaskBatch(labId: string, ids: string[]) {
  return request({
    url: authApiTransform(`/api/indoor-screen/test/end/batch/${labId}`),
    method: "post",
    data: ids
  })
}

/**
 * # 取消一个子试验
 */
export function deleteLabSubTask(id: string) {
  return request({
    url: authApiTransform(`/api/indoor-screen/test/cancel/${id}`),
    method: "delete"
  })
}

/**
 * # 查询任务所属的检测样品
 */
export function getTaskTestObject(testObjectId: string) {
  return request({
    url: `/api/indoor-screen/task/test-object/${testObjectId}`,
    method: "get"
  })
}

/**
 * # 查询委托信息
 */
export function getConsignInfo(consignId: string) {
  return request({
    url: `/api/indoor-screen/task/consign/${consignId}`,
    method: "get"
  })
}

/**
 * # 查询功能室设备
 */
export function getLabEq(labId: string) {
  return request({
    url: `/api/indoor-screen/lab/${labId}/equipments`,
    method: "get"
  })
}

export interface LaboratoryDeviceStatus {
  /** # 空调开关状态 */
  temIotStatus: boolean
  /** # 空调的当前温度（在空调开启的情况下，温度大于房间温度展示升温，温度小于房间温度展示降温） */
  temIotValue: number
  /** # 加湿器开关状态 */
  addHumIotStatus: boolean
  /** # 除湿器开关状态 */
  subHumIotStatus: boolean
}

/**
 * # 查询功能室设备状态
 */
export async function getLaboratoryDeviceStatusData(ids: string) {
  const { data } = await request.post("/api/indoor-screen/lab/iot-eq/get", { ids })
  return data as LaboratoryDeviceStatus
}

const cacheBusinessParam: {
  [key: string]: boolean | string
} = {}

/**
 * 获取系统参数
 * 并将获取的参数做页面级缓存（刷新页面后重新获取）
 * @param key 系统参数key
 * @param originValue 获取接口返回的原始值
 */
export async function getBusinessParam(
  key: string,
  originValue = false
): Promise<boolean | string> {
  if (cacheBusinessParam[key] !== undefined) {
    return cacheBusinessParam[key] as boolean
  }

  const res = await request.get("api/tSBusinessParamController?getBusinessParam", {
    params: { key }
  })

  if (originValue === true) {
    cacheBusinessParam[key] = res.obj
    return cacheBusinessParam[key] as string
  }

  cacheBusinessParam[key] = res.obj === "Y"

  return cacheBusinessParam[key] as boolean
}

export async function getTemplateConfig(id: string): Promise<any> {
  return request({
    url: `/api/smart-screen/template/${id}`,
    method: "get"
  })
}

/**
 * 获取功能室自定义资料项
 */
export async function getScreenCustomInfo(params: { customScreenId: string }): Promise<any> {
  return request({
    url: "/api/laboratoryScreenController/custom/info",
    method: "get",
    params
  })
}

/**
 * 获取设备外出申请列表
 */
export interface EqOutApplyData {
  /** 申请理由 */
  reason: string
  /** 外出申请单号 */
  egressApplySn: string
  /** 需求日期 */
  requiredDate: number
  remark: null
  expectReturnTime: number
  /** 借用人 */
  borrowUser: string
  /** 外出时间 */
  egressTime: number
  testTaskSn: null
  location: null
  /** 设备编号+名称 */
  equipmentName: string
  id: string
  projectName: string
  createDate: number
}
/**
 * 获取设备外出申请列表
 */
export async function getEqOutApplyList(params: {
  page: number
  size: number
  labId: string
}): Promise<{ data: { rows: EqOutApplyData[]; total: number }; msg: string; code: number }> {
  return request({
    url: "/api/indoor-screen/equipment/egress-apply",
    method: "get",
    params
  })
}

/**
 * 获取设备外出申请详情
 */
export interface EqOutApplyDetailData {
  createDate: number //外出申请时间
  egressApplySn: string //外出申请单号
  applyStatus: string
  id: string
  projectName: string //工程项目
  projectCode?: string
  testTaskSn?: string //任务编号
  borrowUser: string //借用人
  borrowUserId: string
  egressTime: string //外出时间
  expectReturnTime: string //预还时间
  remark?: string //备注
  location?: string //使用地点
  requiredDate: number //需求日期
  reason: string //申请理由
  tag?: string
  attachments: []
  equipments: [
    {
      id: string
      name: string //设备名称
      equipmentSn: string //设备编号
      archiveSn: string
      assetSn: string
      status: string
      standard: string
      eqRange: string
      accuracy: string
      nextCheckDate?: number
    }
  ]
  projects: [
    {
      projectName: string
    }
  ]
}
/**
 * 获取设备外出申请详情
 */
export async function getEqOutApplyDetail(
  egressApplyId: string
): Promise<{ data: EqOutApplyDetailData; msg: string; code: number }> {
  return request({
    url: `/api/indoor-screen/equipment/egress-apply/${egressApplyId}/detail`,
    method: "get"
  })
}

export enum HumitureOverTypeEnum {
  温度超标 = "TEM",
  湿度超标 = "HUM",
  全部超标 = "ALL"
}

export interface SaveHumitureOverReocrdEntity {
  laboratory: {
    id: "297e85c296f229ed0196f5e467b20007" //功能室id
  }
  type: "ALL" //超标类型 TEM温度超标 HUM湿度超标 ALL都超标
  testTaskHisId: "111" //子实验id
  testTaskCode: "1" //任务编号
  testSampleCode: "2" //样品编号
  testSampleName: "3" //样品名称
  testParamName: "4" //参数名称
  taskUser: "5" //试验人员
  tem: 10 //温度
  hum: 20 //湿度
  standardMinTem: 10 //标准最低温度
  standardMaxTem: 20 //标准最高温度
  standardMinHum: 30 //标准最低湿度
  standardMaxHum: 40 //标准最高湿度
  mark: string
}

/**
 * 保存超标记录
 */
export async function saveHumitureOverReocrd(data: SaveHumitureOverReocrdEntity[]): Promise<any> {
  return request({
    url: "/api/humiture/over/record",
    method: "post",
    data
  })
}

/**
 * 获取授权登录二维码
 */
export async function getAuthQrCode(): Promise<any> {
  return request({
    url: "/api/screen/auth/qr-code"
  })
}

/**
 * 检查二维码授权
 */
export async function checkQrCodeAuth(key): Promise<any> {
  return request({
    url: `/api/screen/auth/qr-code/${key}`
  })
}

export interface CurrentUserDTO {
  id: "8a8ab0b246dc81120146dc8181950052"
  unitCode: "gfzx"
  userName: "admin"
  ssoName: "cs01"
  realName: "管理员"
  browser: null
  userKey: "管理员"
  password: null
  pwdLastUpdateDate: 1751272486000
  pwdOverdue: false
  activitiSync: null
  status: 1
  deleteFlag: 0
  signature: null
  departid: "8a8ab0b246dc81120146dc8180ba0017"
  strength: 10
  currentDepart: null
  departmentIds: null
  roleIds: null
  roleCodes: "admin,"
  signatureFile: ""
  mobilePhone: "15215017478"
  officePhone: "11"
  email: "22@qq.com"
  createDate: 1469003175000
  createBy: null
  createName: null
  updateDate: 1754397004000
  updateBy: "admin"
  updateName: "管理员"
  signPhoto: "http://192.168.2.65:8080/fileShare/gfzx/A03/images/2023/7cf5771e-a5b5-4452-9561-900e2f2e65a5.jpg"
  loginTimes: 27380
  jobTitle: ""
  certificateNo: "1"
  birthDay: number | string
  iconUrl: "http://192.168.2.65:8080/fileShare/gfzx/A03/images/2025/03ff1f6a-5966-42e1-b265-f38708e10cb1.jpg"
  signKey: "387f75e208a34461b1bf51ec2fbabdc6"
  tripartiteUserId: "2940174047516569611"
  tripartiteType: "deed"
  signKeyEnableTime: null
  signKeyExpireTime: null
  rfid: ""
  idCard: "522426199605153246"
  authStatus: "AUTH_SUCCESS"
  type: 1
  authNo: "2700b36ef3934dbf835bcc2854cf1d54"
  deedStatus: null
}

/**
 * 根据token授权登录
 */
export async function getCurrentUserInfo(token): Promise<any> {
  return request({
    url: `/userController/user/info`,
    headers: {
      Authorization: token
    }
  })
}

/**
 * 退出登录（清除cookie信息）
 */
export async function userLogout(): Promise<any> {
  return request({
    method: "get",
    url: `/loginController.do?logoutAjax`
  })
}

export interface ScreenAuthConfigDTO {
  authorizationRequired: boolean
  optEquipment: boolean
  optScheduleTask: boolean
  optAppointmentTask: boolean
  optTestTask: boolean
  optIntelligentSampleTask: boolean
  staticExitTime: number
}

/**
 * 获取设备授权屏操作权限配置
 */
export async function getScreenAuthConfig(): Promise<any> {
  return request({
    url: `/api/screen/auth/config`
  })
}

/**
 * 留样室详情统计数据
 */
export async function sampleStorageRoomStatisticsApi(
  labId: string,
  version?: VERSION
): Promise<any> {
  return request({
    url: `/api/sampleSaveRoom/statistics/${labId}`,
    method: "get",
    params: {
      version: version || VERSION.V2
    }
  })
}

/** 留样室详情 */
export async function sampleStorageRoomDetailApi(
  params: SampleStorageRoomQueryParams
): Promise<any> {
  return request({
    url: `/api/sampleSaveRoom/inventoryDetail`,
    method: "get",
    params: {
      ...params,
      version: params.version || VERSION.V2
    }
  })
}

/**
 * 标养室详情统计数据
 */
export async function standardRoomStatisticsApi(labId: string): Promise<any> {
  return request({
    url: `/api/standard-room-screen/${labId}`,
    method: "get"
  })
}
/** 标养室详情 */
export async function standardRoomDetailApi(params): Promise<any> {
  return request({
    url: `/api/standard-room-screen/list`,
    method: "get",
    params
  })
}

/**
 * 标准物质间详情统计数据
 */
export async function standardSubstanceRoomStatisticsApi(labId: string): Promise<any> {
  return request({
    url: `/api/consumables-room-screen/${labId}`,
    method: "get"
  })
}
/** 标准物质间详情 */
export async function standardSubstanceRoomDetailApi(params): Promise<any> {
  return request({
    url: `/api/consumables-room-screen/list`,
    method: "get",
    params
  })
}

/**
 * 外检室详情统计数据
 */
export async function externalCheckRoomStatisticsApi(labId: string): Promise<any> {
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/statistics`,
    method: "get"
  })
}
/** 外检室详情 */
export async function externalCheckRoomDetailApi(params): Promise<any> {
  const labId = params.labId
  delete params.labId
  return request({
    url: `/api/externalInspectionRoom/${labId}/eq/info`,
    method: "get",
    params
  })
}

/**
 * 样品室详情统计数据
 */
export async function sampleRoomStatisticsApi(labId: string): Promise<any> {
  return request({
    url: `/api/sampleRoom/statistics/${labId}`,
    method: "get"
  })
}
/** 样品室详情 */
export async function sampleRoomDetailApi(params): Promise<any> {
  params.version = VERSION.V2
  return request({
    url: `/api/sampleRoom/inventoryDetail`,
    method: "get",
    params
  })
}

/**
 * 药品室详情统计数据
 */
export async function chemicalRoomStatisticsApi(): Promise<any> {
  return request({
    url: `/api/chemical-room-screen/statistics`,
    method: "get"
  })
}
/** 药品室详情 */
export async function chemicalRoomDetailApi(params): Promise<any> {
  return request({
    url: `/api/chemical-room-screen/inventory`,
    method: "get",
    params
  })
}
