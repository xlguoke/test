import type { TraceabilityEntity } from './TraceabilityEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export function getListApi(params: Record<string, any>) {
  return IlisApiHelper.get<TraceabilityEntity>('equipment-traceability/page', params)
}

export function updateTraceabilityApi(data: TraceabilityEntity) {
  return IlisApiHelper.put<TraceabilityEntity>(`equipment-traceability/${data.id}`, data)
}

export function addTraceabilityApi(data: TraceabilityEntity) {
  return IlisApiHelper.post<TraceabilityEntity>(`equipment-traceability`, data)
}

export function deleteTraceabilityApi(id: string) {
  return IlisApiHelper.delete<any>(`equipment-traceability/${id}`)
}
