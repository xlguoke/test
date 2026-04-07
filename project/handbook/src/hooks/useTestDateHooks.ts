import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { SystemParamService, SystemParamType } from '@/providers/services/SystemParamService'

const systemParamService = new SystemParamService()

export function useTestDateFormatHooks(isOnlineUdrPage: boolean) {
  const TEST_DATETIME_FORMAT_SHOW = ref()

  if (isOnlineUdrPage) {
    systemParamService.getBusinessParam(SystemParamType.检测时间显示).then((res) => {
      TEST_DATETIME_FORMAT_SHOW.value = res
    })
  }

  const enableTestDateMinute = computed(() => {
    return TEST_DATETIME_FORMAT_SHOW.value === 'TIME_DATE_MIN_minute'
  })

  const dateFormat = computed(() => {
    return enableTestDateMinute.value ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'
  })

  function toShowDate(date?: string | number) {
    if (!date)
      return ''

    return dayjs(date).format(dateFormat.value)
  }

  function toSaveDate(date?: string | number) {
    if (!date)
      return ''

    return dayjs(date).format(dateFormat.value === 'YYYY-MM-DD HH:mm' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
  }

  return {
    toShowDate,
    toSaveDate,
    enableTestDateMinute,
  }
}
