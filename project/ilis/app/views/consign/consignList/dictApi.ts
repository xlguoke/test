import type { IDictionary } from '~/interface/IDictionary'
import { checkTypeApi, qualificationsApi, snTypeApi } from './api'

/** 资质类型 */
export async function getQualificationType(): Promise<IDictionary[]> {
  const { data } = await qualificationsApi()
  return data.map(d => ({
    label: d.name,
    key: d.id,
  }))
}

/** 编号类别 */
export async function getSnType(): Promise<IDictionary[]> {
  const { data } = await snTypeApi()
  return data.obj.map(d => ({
    label: d.name,
    key: d.id,
  }))
}

/** 检测类别 */
export async function getCheckType(): Promise<IDictionary[]> {
  const { data } = await checkTypeApi()
  return data.map(d => ({
    label: d.name,
    key: d.id,
  }))
}
