import type { QueryParams } from '~/api/laboratory.ts'
import type { IDictionary } from '~/interface/IDictionary'
import { getListByGroupId, getOrgComboTree, getProjectOrg } from '~/api/common'
import { getLaboratoryData } from '~/api/laboratory.ts'
import { getIndustryListByUser } from '~/views/unit-config/industryConfig/api'

/**
 * # 提供产生数据字典的方法（基于一些通用数据，如：部门）
 */
export function useCommonDataDict() {
  /** 获取部门 */
  async function getOrgToDict(params?: Record<string, any>
    & { all?: boolean }): Promise<IDictionary[]> {
    const { data } = await getOrgComboTree(params)
    const list: IDictionary[] = []
  ;(function _each(data, _list) {
      data.forEach((item) => {
        const obj = { label: item.text, key: item.id, children: [] }
        if (item.children) {
          _each(item.children, obj.children)
        }
        _list.push(obj)
      })
    })(data || [], list)
    return list
  }

  /** 获取设备所在位置 */
  async function getLocationToDict(): Promise<IDictionary[]> {
    const { data } = await getProjectOrg()
    const list: IDictionary[] = []
  ;(function _each(data, _list) {
      data.forEach((item) => {
        const obj = { label: item.name, key: item.name, children: [] }
        if (item.children) {
          _each(item.children, obj.children)
        }
        _list.push(obj)
      })
    })(data || [], list)
    return list
  }

  /** 获取功能室 */
  async function getLabToDict(queryParams?: QueryParams): Promise<IDictionary[]> {
    const res = await getLaboratoryData(queryParams)
    return res.data.obj.rows.map(i => ({
      key: i.id,
      label: i.name,
    }))
  }

  /** 获取领域数据 */
  async function getIndustryToDict(): Promise<IDictionary[]> {
    const { data } = await getIndustryListByUser()
    const industryList = (data || []).sort((a, b) => (a.sort || 0) - (b.sort || 0))
    return industryList.map((i: any) => ({
      key: i.id,
      label: i.name,
    }))
  }

  /** 字典数据 */
  async function getSystemDict(id: string, idField: 'typecode' | 'typename' = 'typecode'): Promise<IDictionary[]> {
    const { data } = await getListByGroupId(id)
    return data.obj.map(i => ({
      key: i[idField],
      label: i.typename,
    }))
  }

  return {
    /** # 获取部门 */
    getOrgToDict,
    /** # 获取设备所在位置 */
    getLocationToDict,
    /** # 获取功能室 */
    getLabToDict,
    /** 获取领域数据 */
    getIndustryToDict,
    /** 获取字典数据 */
    getSystemDict,
  }
}
