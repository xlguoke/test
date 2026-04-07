import dayjs, { OpUnitType } from "dayjs"
import { ref } from "vue"

interface UseDateHooksOption {
  timeFormat?: string
  delay?: number
}

const useDateHooks = (option: UseDateHooksOption = {}) => {
  const timeFormat = option.timeFormat || "YYYY-MM-DD HH:mm:ss"
  const delay = option.delay || 1000

  const time = ref("")

  const week = ref("")

  setInterval(updateTime, delay)

  function updateTime() {
    const nowDate = dayjs()

    // 时间
    time.value = nowDate.format(timeFormat)

    // 星期
    const day = nowDate.day()
    const weekMap = ["日", "一", "二", "三", "四", "五", "六"]
    week.value = `星期${weekMap[day]}`
  }

  updateTime()

  return {
    time,
    week
  }
}

// 获取起始日期和结束日期
const getDateRangeHook = (TYPE: string) => {
  const type = TYPE.toLowerCase()
  const validTypes = ["day", "week", "month", "year", "all"]
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid date type. Allowed types: ${validTypes.join(", ")}`)
  }
  // 特殊处理 "all" 情况
  if (type === "all") {
    return {
      startTime: "1970-01-01 00:00:00", // 自定义起始时间
      endTime: dayjs().format("YYYY-MM-DD HH:mm:ss") // 当前时间
    }
  }
  const opUnitType = type as OpUnitType
  const startOfTime = dayjs().startOf(opUnitType).format("YYYY-MM-DD HH:mm:ss")
  const endOfTime = dayjs().endOf(opUnitType).format("YYYY-MM-DD HH:mm:ss")
  return {
    startTime: startOfTime,
    endTime: endOfTime
  }
}

export { useDateHooks, getDateRangeHook }
