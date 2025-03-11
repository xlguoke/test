import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

/**
 * 该hook主要用于转换前端组件值和后端需要的值
 * 使用场景：组件绑定值为createDate，后端接口参数为startCreateDate和endCreateDate，可通过该hook快速处理赋值并格式化
 * 使用例子：
 * const [createDate] = useDateRangePickerHooks([null, null], (val) => {
 *   form.startCreateDate = val[0] || null;
 *   form.endCreateDate = val[1] || null;
 * });
 *
 * 注：antdv时间组件使用的dayjs，默认值的设置也推荐直接用dayjs来处理
 */

type DatePickerValueType = string | Dayjs | null

function getFormatDateStr(val: DatePickerValueType, formatStr: string) {
  if (!val) {
    return null
  }

  return dayjs(val).format(formatStr)
}

/**
 * @param onChange 日期组件变动时的赋值逻辑
 * @param formatStr 日期格式化规则
 * @param defaultVal 默认值
 */
export function useDateRangePickerHooks(onChange: (data: [string | null, string | null]) => void, formatStr = 'YYYY-MM-DD', defaultVal?: [string, string] | [Dayjs, Dayjs]) {
  const dateVal = ref()

  watch(dateVal, async (val: [string, string] | [Dayjs, Dayjs]) => {
    onChange([getFormatDateStr(val[0], formatStr), getFormatDateStr(val[1], formatStr)])
  })

  if (defaultVal) {
    dateVal.value = defaultVal
  }

  return [dateVal]
}
