import { ref } from "vue"
import { IOption } from "@/interface/IOption"
import { useUnitDataHooks } from "./useUnitDataHooks"
import { QueryRangeType } from "@/api/dataScreen.api"

const useDataScreenHooks = () => {
  const { unitCode } = useUnitDataHooks()

  const filterOptions = ref<IOption[]>([])

  const filterValue = ref<QueryRangeType>("ALL")

  // 四川智通路桥
  if (unitCode.value === "ztlq") {
    filterOptions.value = [
      { label: "全部", value: "ALL" },
      { label: "本年", value: "YEAR" },
      { label: "本月", value: "MONTH" }
    ]
    filterValue.value = "ALL"
  }

  return {
    unitCode,
    filterOptions,
    filterValue
  }
}

export { useDataScreenHooks }
