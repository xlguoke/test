import request from "@/utils/request.js"

export const DataPlatConfig = {
  api: "https://fdl.scsgjc.com:11443/webroot",
  applicationId: "13b1777b-7c8d-4cd3-8f31-ad7f769ffdfe"
}

export enum FilterDateType {
  天 = "DAY",
  周 = "WEEK",
  月 = "MONTH",
  年 = "YEAR",
  所有 = "ALL"
}

// 不合格报告数量统计
export function getUnqualifiedReportCount(param: { startTime: string; endTime: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/test/report/unqualified/count`,
    method: "get",
    params: param
  })
}
// 不合格报告列表
export function getUnqualifiedReportPage(param: { startTime: string; endTime: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/test/report/unqualified/page`,
    method: "get",
    params: {
      ...param,
      pageSize: 10
    }
  })
}
// 无监控视频报告数量统计
export function getLackVideoReportCount(param: { startTime: string; endTime: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/test/report/lack-video-count`,
    method: "get",
    params: param
  })
}
// 无监控视频报告列表
export function getLackVideoReportPage(param: { startTime: string; endTime: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/test/report/lack-video-list`,
    method: "get",
    params: {
      ...param,
      pageSize: 10
    }
  })
}
// 查询离线的温湿度设备
export function getOfflineTempDevices() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/iot/offline-temp-devices`,
    method: "get",
    params: {
      pageSize: 999
    }
  })
}
// 查询隧道预警的工程项目
export function getTunelwarningProjects() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/tunel-warning/projects`,
    method: "get"
  })
}
// 查询隧道预警统计信息
export function getTunelwarningStatistic(param: {
  timeStart: string
  timeEnd: string
  projectName: string | undefined
}) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/tunel-warning/statistic`,
    method: "get",
    params: param
  })
}

interface WarningPagination {
  timeStart: string | undefined
  timeEnd: string | undefined
  projectName: string | undefined
  blockName: string | undefined
  isTesting: string | boolean | number | undefined
  warningLevel: string | number | undefined
  handleState: string | number | undefined
}
// 查询隧道预警列表
export function getTunelwarningPagination(param: WarningPagination) {
  if (param.isTesting !== undefined) {
    if (param.isTesting === 1) param.isTesting = true
    else {
      param.isTesting = false
    }
  }
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/tunel-warning/pagination`,
    method: "get",
    params: param
  })
}
// 查询隧道预警标段列表
export function getTunelwarningBlocks(lineName: string | undefined) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/tunel-warning/blocks`,
    method: "get",
    params: { lineName }
  })
}

// 公司实验室预警
export function getLaboratoryWarning(param: {
  timeStart: string
  timeEnd: string
  WarnType: number | string | undefined
}) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/yj/laboratory/warnings`,
    method: "get",
    params: param
  })
}

// 工地试验检测 - 查询项目列表
export function getReportProjects() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/yj/report/projects`,
    method: "get"
  })
}

// 工地试验检测 - 查询标段列表
export function getReportSectionsn(ProjectKey?: string) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/yj/report/sections`,
    method: "get",
    params: { ProjectKey }
  })
}
// 工地试验检测 - 查询项目报告统计
export function getReportStatisticByproject(ProjectKey?: string) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/yj/report/statistic/by-project`,
    method: "get",
    params: { ProjectKey }
  })
}
// 工地试验检测 - 查询标段报告统计
export function getReportStatisticBysection(SectionKey: string) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/yj/report/statistic/by-section`,
    method: "get",
    params: { SectionKey }
  })
}
// service/publish/应用ID/tp/st/projects
// 查询升拓项目列表 - 基桩检测统计
export function getPileProjects() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/st/projects`,
    method: "get"
  })
}
// service/publish/应用ID/tp/st/pile/statistic
// 按标段统计检测进度 - 基桩检测统计 - 父级数据列表
interface PilestatisticSearch {
  timeStart: string
  timeEnd: string
  projectId?: string
  sort?: "bridgeCount" | "pileCount" | "testedPileCount"
  order?: "asc" | "desc"
}
export function getPilestatistic(param: PilestatisticSearch) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/st/pile/statistic`,
    method: "get",
    params: param
  })
}

export interface PilestatisticDetermineTypeQuery {
  timeStart: string
  timeEnd: string
  ablock?: string
  projectId?: string
}

// 查询基桩类型分布
export function getPilestatisticDetermineType(param: PilestatisticDetermineTypeQuery) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/st/pile/statistic/determine-type`,
    method: "get",
    params: param
  })
}

// 查询标段下桥梁统计数据
// service/publish/应用ID/tp/st/pile/statistic/by-brige
export function getPilestatisticByBridge(param: {
  ablock: string | undefined
  pageNum: number | undefined
  pageSize: number | undefined
}) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/tp/st/pile/statistic/by-brige`,
    method: "get",
    params: param
  })
}

// 工地试验室检查-检查类别
export function getGdsysjcJclb() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/gdsysjc/jclb`,
    method: "get"
  })
}

// 工地试验室检查-列表
export function getGdsysjcList(jcfl: string) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/gdsysjc/liebiao`,
    method: "get",
    params: { jcfl }
  })
}

// 飞检实体工程-工程类别
export function getFjstgcGclb() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/fjstgc/gclb`,
    method: "get"
  })
}
// 飞检实体工程-检测参数
export function getFjstgcJccs(gcxm: string) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/fjstjsc/jccs`,
    method: "get",
    params: { gcxm }
  })
}
// 飞检实体工程-列表
export function getFjstgcLiebiao(param: { gcxm: string; jccs: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/fjstgc/liebiao`,
    method: "get",
    params: param
  })
}

// 温湿度超标提醒
export function getHumitureOver(range: any, param?: any) {
  return request({
    url: `/api/humiture/dashbord/over/record/${range}`,
    method: "get",
    params: param
  })
}

// 温湿度超标-获取功能室
// http://192.168.2.65/ilis2/api/laboratoryController?dataGridPage&page=1&size=999
export function getRoom(param: { page: number; size: number }) {
  return request({
    url: `/api/laboratoryController`,
    method: "get",
    params: {
      ...param,
      dataGridPage: true,
      noAuth: 1
    }
  })
}

// 各类材料完成数量统计
export function getSampleStatistics(dateType: FilterDateType) {
  return request({
    url: `/api/test/dashboard/sample/statistics/${dateType}`,
    method: "get"
  })
}

// 生产商不合格率 - 样品
export function getSupplierNonconformitySample(params: { start?: string; end?: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/shengchanshang/buhegelv/yangpin`,
    method: "get",
    params
  })
}

// 生产商不合格率 - 参数
export function getSupplierNonconformityParams(params: {
  sampleName: string
  start?: string
  end?: string
}) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/shengchanshang/buhegelv/canshu`,
    params,
    method: "get"
  })
}

// 生产商不合格率统计
export function getSupplierNonconformity(params: { sampleName?: string; paramName?: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/shengchanshang/buhegelv/tongji`,
    params,
    method: "get"
  })
}

// 样品排队周期
export function getSampleQueue() {
  return request({
    url: `/api/test/dashboard/sample/queue/cycle`,
    method: "get"
  })
}

interface GetIndicatorSampleListQuery {
  startDate: string
  endDate: string
  bigCategoryName: string
}

// 分页查询指标散点图待选检测大类
export function getIndicatorCategoryList(params: { startDate: string; endDate: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/category`,
    params,
    method: "get"
  })
}

// 分页查询指标散点图待选样品列表
export function getIndicatorSampleList(params: GetIndicatorSampleListQuery) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/samplelist`,
    params,
    method: "get"
  })
}

interface GetIndicatorDataQuery {
  sampleName: string
  startDate: string
  endDate: string
}

// 指标散点图样品待选的指标
export function getIndicatorData(params: GetIndicatorDataQuery) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/indicators`,
    params,
    method: "get"
  })
}

// 生产商稳定性 - 指标下拉
export function getIndicator(data: { sampleId: string; dateType: string }) {
  return request({
    url: `/api/test/dashboard/indicator/${data.sampleId}/${data.dateType}`,
    method: "get"
  })
}

interface GetSupplierListQuery {
  sampleName: string
  startDate: string
  endDate: string
}

// 厂商列表
export function getSupplierList(params: GetSupplierListQuery) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/agencylist`,
    method: "get",
    params
  })
}

interface GetIndicatorPointsEntity {
  sampleName: string
  indicator: string
  startDate: string
  endDate: string
  projectName?: string
  factory?: string
}

// 散点指标
export function getIndicatorPoints(params: GetIndicatorPointsEntity) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/indicator/reslut`,
    params,
    method: "get"
  })
}

// 散点指标
export function getTemHumRecord(dateType: FilterDateType) {
  return request({
    url: `/api/test/dashboard/temperature/humidity/record/${dateType}`,
    params: {
      page: 1,
      size: 9999
    },
    method: "get"
  })
}

interface GetProjectListQuery {
  startDate: string
  endDate: string
  sampleName: string
}

// 工程项目
export function getProjectList(params: GetProjectListQuery) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/projects`,
    params
  })
}

export interface LabVideoConfigDTO {
  id: string
  name: string
  labConfigList: Array<{
    id: string
    labId: string
    labName: string
    equName: string
    equType: string
    equVendor: string
    supplierName: string
    interfaceUrl: string
    remark?: string
    isDeleted: "0" | "1"
    appSecret: string
    appKey: string
    params: {
      password: string
      loginUrl: string
      startTime: string
      endTime: string
      deviceId: string
      channelId: string
      username: string
    }
  }>
}

// 获取功能室视频配置
export function getLabVideoConfigList() {
  return request({
    url: `/api/test/dashboard/lab/video/config`,
    params: {
      page: 1,
      size: 9999
    },
    method: "get"
  })
}

// 获取监控点视频流
export function getLabVideoConfigData(id: string) {
  return request({
    url: `/api/test/dashboard/lab/video/config/${id}`,
    method: "get"
  })
}

export function getPerformance() {
  return request({
    url: `/api/dashboard/sgjc/hr/performance-appraisal`,
    method: "get"
  })
}

export interface IVideoConfig {
  id: "1"
  labId: "2c9120818ab58877018ab5b51bc20026"
  labName: "xx室内(外检室屏测试)"
  type: "EQ"
  model: "1" | "2"
  labConfigId: "4028b2268b7f0d89018b7f52ac990051"
  labConfigName: "C2力学室"
}

/**
 * # 获取对应大屏下要放视频的房间列表
 * @param type EQ：物资设备屏 CONSIGN：委托样品 TEST：材料检测
 * @returns
 */
export function getPlayLabs(
  type: "EQ" | "CONSIGN" | "TEST" | "BUILDING"
): Promise<{ data: IVideoConfig[]; code: number }> {
  return request({
    url: `/api/eq/dashboard/video/config/${type}`,
    method: "get"
  })
}

// 生产商稳定性排行 - 样品
export function getSupplierStabilitySample(params: { start?: string; end?: string }) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/shengchanshang/wendingxing/yangpin`,
    method: "get",
    params
  })
}

// 生产商稳定性排行 - 参数
export function getSupplierStabilityParams(params: {
  sampleName: string
  start?: string
  end?: string
}) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/shengchanshang/wnedingxing/canshu`,
    params,
    method: "get"
  })
}

// 生产商稳定性排行
export function getSupplierStability(params: {
  sampleName: string
  paramName: string
  start?: string
  end?: string
}) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/shengchanshang/wendingxing/tongji`,
    params,
    method: "get"
  })
}

// 获取材料驾驶舱大类默认的样品和指标
export function getDashboardDefault() {
  return request({
    url: `/api/testSampleController/dashboard/default`,
    method: "get"
  })
}

// 大类
export function getDashboardBigCategory() {
  return request({
    url: `/api/bigCategoryController/dashboard/list`,
    method: "get"
  })
}

export function getDictByCode(code: string) {
  return request.get("api/type/getTypesByGroupCode", {
    params: {
      groupCode: code
    }
  })
}

// 人员统计
export function getUserStatistics() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/user`,
    method: "get"
  })
}

// 车辆统计
export function getParkingLotStatistics() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/parking-lot`,
    method: "get"
  })
}

// 车辆出入库
export function getCarRecord(num: number) {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/car-record`,
    params: {
      num
    },
    method: "get"
  })
}
