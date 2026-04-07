import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import request from '@/utils/request'

export interface HumitureBookParam {
  page: number
  size: number
  labId: string
  quickQry?: string
  startDate?: string
  endDate?: string
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

export interface HumitureDetailParams {
  id?: string
  page: number
  size: number
  startDate: string
  endDate: string
  quickQry?: string
}

export interface HumitureDetail {
  temperature: {
    ts: number
    value: string
  }[]
  humidity: {
    ts: number
    value: string
  }[]
}

function apiPrefix() {
  const { isNeedAuth } = usePermissionStore()
  return isNeedAuth === IsNeedAuth.YES ? '/rest' : '/api'
}

/** 获取功能室下的调养箱列表 */
export async function humitureBookPage(params: HumitureBookParam): Promise<any> {
  return request.get(`${apiPrefix()}/indoor-screen/humiture/book/page`, { params })
}

/** 调养箱温湿度标准范围配置 */
export async function humitureBookConfig(): Promise<{ code: number, data: HumitureBookBaseConfig }> {
  return request.get(`${apiPrefix()}/indoor-screen/humiture/book/config`)
}

/** 获取调养箱采集数据 */
export function humitureBookDetail(params: HumitureDetailParams): Promise<{ data: HumitureDetail }> {
  const id = params.id
  delete params.id
  return request.get(`${apiPrefix()}/humiture/book/${id}/values`, { params })
}
