import { getUrlParam } from "@/utils/utils"
import { ref } from "vue"

const useUnitDataHooks = () => {
  const unitCode = ref(getUrlParam("unitCode") || localStorage.getItem("unitCode") || "")

  return {
    unitCode
  }
}

export { useUnitDataHooks }
