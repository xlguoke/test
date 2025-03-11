import type { IOption } from '~/interface/IOption.ts'
import type { LaboratoryDataEntity, QueryParams } from '~/api/laboratory.ts'
import { getLaboratoryData } from '~/api/laboratory.ts'

interface LaboratoryDataEntityOption extends LaboratoryDataEntity, IOption {}

/**
 * 功能室下拉数据
 */
export function useLaboratoryOptionsHook(query?: QueryParams) {
  const laboratoryOptions = ref<LaboratoryDataEntityOption[]>([])

  const laboratoryTreeData = ref<any>([])

  getLaboratoryData(query).then((res) => {
    const data = res.data

    if (data.success) {
      const rows = data.obj.rows
      laboratoryOptions.value = rows.map(item => ({
        ...item,
        label: item.name,
        value: item.id,
      }))

      laboratoryTreeData.value = [{
        label: '全选',
        value: 'all',
        expand: true,
        children: rows.map(item => ({
          ...item,
          label: item.name,
          value: item.id,
        })),
      }]
    }
  })

  return { laboratoryOptions, laboratoryTreeData }
}
