import { IotDataRequest } from '@/pages/iotDataRequest'
import { type HumitureBookBaseConfig, humitureBookConfig, humitureBookDetail } from '..'

export interface HumitureDetailData {
  time: string
  temperature: string
  humidity: string
}

// const mockList = {
//   temperature: [
//     {
//       ts: 1751414392098,
//       value: '10.2',
//     },
//     {
//       ts: 1751414329358,
//       value: '32.2',
//     },
//     {
//       ts: 1751414266613,
//       value: '24.2',
//     },
//     {
//       ts: 1751414203841,
//       value: '24.2',
//     },
//     {
//       ts: 1751414203831,
//       value: '',
//     },
//     {
//       ts: 1751414203821,
//       value: '24.2',
//     },
//     {
//       ts: 1751414203541,
//       value: '24.2',
//     },
//     {
//       ts: 1751414202841,
//       value: '24.2',
//     },
//     {
//       ts: 1751414201841,
//       value: '24.2',
//     },
//   ],
//   humidity: [
//     {
//       ts: 1751414392098,
//       value: '83',
//     },
//     {
//       ts: 1751414329358,
//       value: '75',
//     },
//     {
//       ts: 1751414266613,
//       value: '120',
//     },
//     {
//       ts: 1751414203841,
//       value: '83',
//     },
//     {
//       ts: 1751414141165,
//       value: '83',
//     },
//     {
//       ts: 1751414140165,
//       value: '83',
//     },
//     {
//       ts: 1751414131165,
//       value: '83',
//     },
//     {
//       ts: 1751414121165,
//       value: '83',
//     },
//   ],
// }

export function useIncubatorConfig() {
  /** 采集数据 */
  const datas = ref<HumitureDetailData[]>([])
  /** 是否超标 */
  const statusObj = ref<Record<string, Record<string, boolean>>>({})
  const baseConfig = ref<HumitureBookBaseConfig>({
    minTem: '',
    maxTem: '',
    minHum: '',
    maxHum: '',
    temRange: '',
    humRange: '',
    bookShow: true,
    init: false,
  })
  const isBaseConfig = computed(() => baseConfig.value.temRange || baseConfig.value.humRange)
  const { value: dayBeforeDate } = useDateFormat(Date.now() - 8640000, 'YYYY-MM-DD HH:mm:ss')
  const { value: nowDate } = useDateFormat(Date.now(), 'YYYY-MM-DD HH:mm:ss')

  const iotDataRequest = new IotDataRequest()

  /** 获取调养箱标准数据 */
  async function getBaseConfig() {
    const { data } = await humitureBookConfig()
    if (data.minTem && data.maxTem) {
      data.temRange = `${data.minTem}℃-${data.maxTem}℃`
    }
    if (data.minHum && data.maxHum) {
      data.humRange = `${data.minHum}%rh-${data.maxHum}%rh`
    }
    data.init = true
    baseConfig.value = data
  }

  if (!baseConfig.value.init) {
    getBaseConfig()
  }

  function formatData(data: any): HumitureDetailData[] {
    // data = mockList

    const temperature = data.temperature || []
    const humidity = data.humidity || []
    const dataObj: Record<string, HumitureDetailData> = {}
    for (let i = 0; i < temperature.length; i++) {
      const item = temperature[i]
      dataObj[item.ts] = {
        time: useDateFormat(item.ts, 'YYYY-MM-DD HH:mm:ss').value,
        temperature: item.value,
        humidity: '',
      }
    }
    for (let i = 0; i < humidity.length; i++) {
      const item = humidity[i]
      if (dataObj[item.ts]) {
        dataObj[item.ts].humidity = item.value
      }
      else {
        dataObj[item.ts] = {
          time: useDateFormat(item.ts, 'YYYY-MM-DD HH:mm:ss').value,
          temperature: '',
          humidity: item.value,
        }
      }
    }
    return Object.values(dataObj)
  }

  /** 获取调养箱采集数据 */
  async function getHumitureBookDetail(id: string, query: Record<string, string> = {}): Promise<HumitureDetailData[]> {
    try {
      const { data } = await humitureBookDetail({
        id,
        page: 1,
        size: 999,
        startDate: dayBeforeDate,
        endDate: nowDate,
        ...query,
      })
      return formatData(data)
    }
    catch (err) {
      console.error(err)
      return []
    }
  }

  /** 实时更新温湿度数据 */
  async function listenCollectDataUpdate(rows: any[]) {
    const listenData = rows.map((item, index) => {
      return {
        entityType: 'DEVICE',
        entityId: item?.id,
        cmdId: index,
      }
    })

    iotDataRequest.listenDataUpdate(listenData, (res) => {
      const { data: { temperature, humidity } } = res

      rows.forEach((item, index) => {
        if (index === res.subscriptionId) {
          if (temperature?.length) {
            item.temperature = temperature[0][1] || ''
          }

          if (humidity?.length) {
            item.humidity = humidity[0][1] || ''
          }
        }
      })
    })
    return rows
  }

  /** 数据更新后，检测是否超标 */
  const changeData = computed(() => [datas.value, baseConfig.value.init])
  watch(
    () => changeData.value,
    () => {
      const { init, minTem, maxTem, minHum, maxHum, temRange, humRange } = baseConfig.value
      if (!init || !changeData.value.length)
        return

      datas.value.forEach((item: any) => {
        const obj: any = {
          temperature: false,
          humidity: false,
        }
        const tem = Number(item.temperature || '0')
        const hum = Number(item.humidity || '0')
        if (item.temperature && temRange && (tem < Number(minTem || '') || tem > Number(maxTem || ''))) {
          obj.temperature = true
        }
        if (item.humidity && humRange && (hum < Number(minHum || '') || hum > Number(maxHum || ''))) {
          obj.humidity = true
        }

        statusObj.value[item.time] = obj
      })
    },
  )

  onUnmounted(() => {
    iotDataRequest.closeWebSocket()
  })

  return {
    datas,
    statusObj,
    isBaseConfig,
    dayBeforeDate,
    nowDate,
    baseConfig,
    listenCollectDataUpdate,
    getHumitureBookDetail,
  }
}
