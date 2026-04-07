<template>
  <HtModal
    v-model:open="visible"
    title="调养箱采集详情"
    width="1000px"
    hide-confirm
    fixed-height
    :loading="loading"
    :after-close="onClosed"
  >
    <div class="flex flex-col h-full gap-2">
      <IlisFormSearch
        :entity="BookDetailEntity"
        :init-data="initQuery"
        @search="onSearch"
        @reset="onReset"
      />

      <p v-if="param.name || param.id" class="mb-0">
        {{ param.name }} {{ param.id || '' }}
      </p>

      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          :entity="BookDetailEntity"
          :data-source="dataSource"
          :table-height="tableHeight"
          :pagination="getPagination()"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'normTem'">
              {{ baseConfig.temRange || '--' }}
            </template>
            <template v-else-if="column.dataIndex === 'normHum'">
              {{ baseConfig.humRange || '--' }}
            </template>
            <template v-else-if="column.dataIndex === 'temperature'">
              <span :class="`${statusObj[record.time]?.temperature ? 'text-red-500' : ''}`">{{ text || '--' }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'humidity'">
              <span :class="`${statusObj[record.time]?.humidity ? 'text-red-500' : ''}`">{{ text || '--' }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'status'">
              <span v-if="statusObj[record.time]?.temperature || statusObj[record.time]?.humidity" class="text-red-500">超标</span>
              <span v-else-if="!isBaseConfig || (!record.temperature && !record.humidity)">--</span>
              <span v-else>正常</span>
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a-button type="link" size="small">
                采集详情
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { HumitureBookBaseConfig } from '../api.ts'
import type { BookListEntity } from '../bookEntity.ts'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import dayjs from 'dayjs'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks.ts'
import { getHumitureBookConfig, getHumitureBookDetail } from '../api.ts'
import { BookDetailEntity } from '../bookEntity.ts'

const props = defineProps<IDialogPropsParam<null, BookListEntity>>()

const visible = ref(true)
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

// 状态对象，用于存储每条数据的温湿度超标状态
const statusObj: any = ref({})

const initQuery = ref(BookDetailEntity.fromJSON({}))

function initTimestamp() {
  const timestamp = [
    dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().format('YYYY-MM-DD HH:mm:ss'),
  ]
  initQuery.value.timestamp = timestamp
  return {
    startDate: timestamp[0],
    endDate: timestamp[1],
  }
}

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  handleSearch,
  handleReset,
  getPagination,
} = useLocalTableHooks<any>({
  api: getHumitureBookDetail,
  payload: {
    id: props.param.id,
  },
  immediate: false,
  responseDataTransform: (data: any) => {
    // data = {
    //   temperature: [
    //     {
    //       ts: 1751414392098,
    //       value: '8',
    //     },
    //   ],
    //   humidity: [
    //     {
    //       ts: 1751414392098,
    //       value: '75',
    //     },
    //   ],
    // }
    return formatData(data)
  },
})

function formatData(data: any) {
  const temperature = data.temperature || []
  const humidity = data.humidity || []
  const dataObj: any = {}
  for (let i = 0; i < temperature.length; i++) {
    const item = temperature[i]
    dataObj[item.ts] = {
      time: dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss'),
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
        time: dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss'),
        temperature: '',
        humidity: item.value,
      }
    }
  }
  return Object.values(dataObj)
}

async function getConfig() {
  const { data } = await getHumitureBookConfig()
  if (data.minTem && data.maxTem) {
    data.temRange = `${data.minTem}-${data.maxTem}`
  }
  if (data.minHum && data.maxHum) {
    data.humRange = `${data.minHum}-${data.maxHum}`
  }
  data.init = true
  baseConfig.value = data
}

function onSearch(q: Record<string, any>) {
  const query = { ...q }
  if (query.timestamp && query.timestamp.length) {
    const s = query.timestamp[0]
    const e = query.timestamp[1]
    query.startDate = s
    query.endDate = e
  }
  else {
    const { startDate, endDate } = initTimestamp()
    query.startDate = startDate
    query.endDate = endDate
  }
  delete query.timestamp
  handleSearch(query)
}

function onReset() {
  const q = initTimestamp()
  handleReset(q)
}

const changeData = computed(() => [dataSource.value, baseConfig.value.init])
watch(
  () => changeData.value,
  () => {
    const { init, minTem, maxTem, minHum, maxHum, temRange, humRange } = baseConfig.value
    if (!init || !changeData.value.length)
      return

    dataSource.value.forEach((item: any) => {
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

onMounted(() => {
  getConfig()
})
</script>
