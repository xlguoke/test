import { IlisApiHelper } from '~/utils/IlisApiHelper'

/**
 * 外出设备数量统计
 */
export function egressStatisticsApi() {
  return IlisApiHelper.get<any>('rest/eqEgress/statistics')
}

/** 设备上报列表 */
export function egressLocateApi(params: { query?: string }) {
  return IlisApiHelper.get<any>('rest/eq/egress/locate/list', params)
}

/** 设备外出位置上报记录 */
export function egressLocateLocusApi(egressId: string) {
  return IlisApiHelper.get<any>(`rest/eq/egress/locate/locus/${egressId}`)
}
