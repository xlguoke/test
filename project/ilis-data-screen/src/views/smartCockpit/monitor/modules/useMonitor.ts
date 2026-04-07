import { ref } from "vue"
import dayjs from "dayjs"

export function useMonitor() {
  const peroidVal = ref("近一周")
  const peroidFilterOptions = ref([
    {
      label: "近一周",
      value: "近一周"
    },
    {
      label: "近一月",
      value: "近一月"
    }
  ])

  function formatPeroidDate(type: "近一周" | "近一月") {
    return type === "近一周"
      ? {
          startDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
          endDate: dayjs().format("YYYY-MM-DD")
        }
      : {
          startDate: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
          endDate: dayjs().format("YYYY-MM-DD")
        }
  }

  return {
    peroidVal,
    peroidFilterOptions,
    formatPeroidDate
  }
}
