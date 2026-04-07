import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 分页查询参数 */
export interface PageParams {
  quickQry?: string
  startDate?: string
  endDate?: string
}
/** 分页查询 */
export function getHumitureBookPage(params: any) {
  return IlisApiHelper.get('rest/humiture/book/page', params)
}

/** 获取采集数据详情 */
interface DetailParams extends PageParams {
  id?: string
}
export function getHumitureBookDetail(params: DetailParams) {
  const id = params.id
  delete params.id
  return IlisApiHelper.get<any>(`rest/humiture/book/${id}/values`, params)
}

/** 配置的标准数据 */
export interface HumitureBookBaseConfig {
  minTem: string // 温度
  maxTem: string // 温度
  maxHum: string // 湿度
  minHum: string // 湿度
  /** 调养箱标准温湿度值设定 */
  bookShow: boolean
  temRange: string
  humRange: string
  init: boolean
}
/** 获取调养箱系统参数配置 */
export function getHumitureBookConfig() {
  return IlisApiHelper.get<HumitureBookBaseConfig>(`rest/humiture/book/config`)
}
