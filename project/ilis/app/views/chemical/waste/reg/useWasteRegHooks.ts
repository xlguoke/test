import type { IOption } from '~/interface/IOption.ts'
import { ref } from 'vue'
import { getDictByCode } from '~/api/common.ts'

export function useWasteRegHooks() {
  const wasteTypeList = ref<IOption[]>([])

  function getWasteTypeText(code: string) {
    const item = wasteTypeList.value.find(i => i.value === code)
    return item ? item.label : ''
  }

  getDictByCode('chemicalWasteMaterialType').then((res) => {
    wasteTypeList.value = res.data.map(item => ({
      label: item.typeName,
      value: item.typeCode,
    }))
  })

  return {
    wasteTypeList,
    getWasteTypeText,
  }
}
