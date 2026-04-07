<template>
  <div px16 pb16>
    <div mb20 card px0 pb0 overflow-hidden>
      <div class="pb12 w-full flex-x justify-center gap12" style="border-bottom: 1px solid #fff;">
        <van-icon name="arrow-left" class="text-primary" @click="prevMonth()" />
        <div @click="fullcalendarApi.today()">
          {{ dayjs(monthPicker).format('YYYY-MM-DD') }}
        </div>
        <van-icon name="arrow" class="text-primary" @click="nextMonth()" />
      </div>
      <FullCalendar
        ref="fullCalendarRef"
        class="customFullCalendar"
        :options="calendarOptions"
      >
        <template #eventContent="arg">
          <div class=" h-full flex-x items-center px2 overflow-hidden pointer-events-none">
            <i class="w3 h3 rounded-full mr2 flex-shrink-0" :style="{ backgroundColor: arg?.event.borderColor }"></i>
            <del v-if="arg?.event?.extendedProps?.status === ResStatus.已取消" ellipsis>{{ arg?.event?.title }}</del>
            <span v-else ellipsis>{{ arg?.event?.title }}</span>
          </div>
        </template>
      </FullCalendar>
    </div>
    <FullCalendar
      ref="fullCalendarTimeRef"
      :options="timeCalendarOptions"
      class="mb20 card timeCalendar"
    >
      <template #eventContent="arg">
        <div :id="arg?.event.id" class=" h-full flex-x items-center px8">
          <i class="w6 h6 rounded-full mr4 flex-shrink-0" :style="{ backgroundColor: arg?.event.borderColor }"></i>
          <del v-if="arg?.event?.extendedProps?.status === ResStatus.已取消" ellipsis>{{ arg?.event?.title }}</del>
          <span v-else ellipsis>{{ arg?.event?.title }}</span>
        </div>
      </template>
    </FullCalendar>
  </div>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import FullCalendar from '@fullcalendar/vue3'
import momentPlugin from '@fullcalendar/moment'
import dayGridPlugin from '@fullcalendar/daygrid' // 日历展示方式：月
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction' // for selectable
import type { CalendarApi, CalendarOptions } from '@fullcalendar/core' // 类型定义
import { getHumitureResList } from '@/pages/room'
import { ResStatus } from '@/pages/appointment-management'

const props = defineProps<{
  selectedLaboratory: string[]
}>()

const router = useRouter()

// 自定义格式化插件
dayjs.extend(customParseFormat)
// 计算间隔插件
dayjs.extend(duration)

/** 事件集合 */
const eventsArr: Ref<any[]> = ref([])
const timeCalendarEvents: Ref<any[]> = ref([])

/** 日历ref */
const fullCalendarRef = ref(null)
const fullCalendarTimeRef = ref(null)

/** 日历的api */
const fullcalendarApi = ref<CalendarApi>()
const fullcalendarTimeApi = ref<CalendarApi>()

/** 当前日期 */
const monthPicker = ref(dayjs(new Date()))

const weekObj = { 0: '周日', 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六' }

const sourceData = ref([])

// https://fullcalendar.io/docs#toc
const calendarOptions: Ref<CalendarOptions> = ref({
  plugins: [interactionPlugin, dayGridPlugin, momentPlugin], // 加载插件
  initialView: 'dayGridMonth', // 日历展示方式：月， 依赖`dayGridPlugin`插件
  height: 'auto',
  handleWindowResize: true, // 是否随浏览器窗口大小变化而自动变化。
  // 星期映射为中文
  dayHeaderContent(arg) {
    return weekObj[arg.dow]
  },
  headerToolbar: false, // 隐藏头部工具栏，因为没有插槽功能，所以需要自己在日历外面写头部工具栏
  aspectRatio: 1, // 设置日历单元格宽度与高度的比例
  dayMaxEventRows: 2, // 单日最大事件行数
  dayPopoverFormat: 'YYYY-MM-DD',
  displayEventTime: false,
  moreLinkContent({ num }) {
    return `+${num}...`
  },
  // locale: 'zh-cn', // 切换语言，当前为中文，切了之后每一天会变成1日，2日...所以不要切换，选择自定义 dayHeaderContent
  firstDay: 0, // 设置一周中显示的第一天是哪天，周日是0，周一是1，类推
  /** 事件（在日历上做标记） */
  events: eventsArr.value,
  /** 事件点击 */
  // eventClick: clickCalendar,
  // eventClick: (info) => {
  //   console.log(info)

  //   const date = info.event.start // 获取事件的开始日期
  //   if (date) {
  //     // 手动触发日期选中逻辑
  //     calendarOptions.value.dateClick?.({
  //       date,
  //       dayEl: info.el,
  //       jsEvent: undefined,
  //       view: undefined,
  //       dateStr: '',
  //       allDay: false,
  //     })
  //   }
  // },
  dateClick({ date, dayEl }) {
    monthPicker.value = dayjs(date)
    fullcalendarTimeApi.value?.gotoDate(dayjs(date).format('YYYY-MM-DD'))
    document.querySelector('.custom-hightlight')?.classList?.remove('custom-hightlight')
    dayEl.classList.add('custom-hightlight')

    // 获取当前日期的预约记录并滚动到首个事件
    const events = fullcalendarTimeApi.value?.getEvents()
    const todayEvents = events?.filter((item) => {
      return dayjs(item?.start).format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD')
    })
    if (todayEvents?.length) {
      nextTick(() => {
        scrollTo(todayEvents[0].id)
      })
    }
  },
})
const timeCalendarOptions: Ref<CalendarOptions> = ref({
  plugins: [interactionPlugin, timeGridPlugin], // 加载插件
  initialView: 'timeGridDay', // 日历展示方式：单日时间表， 依赖`timeGridPlugin`插件
  dayHeaders: false, // 隐藏头部
  handleWindowResize: true, // 是否随浏览器窗口大小变化而自动变化。
  allDaySlot: false, // 不展示全天栏
  slotDuration: '01:00:00',
  eventMaxStack: 2, // 最大事件行
  // height: '200px',
  height: 'auto',
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
  },
  headerToolbar: false, // 隐藏头部工具栏，因为没有插槽功能，所以需要自己在日历外面写头部工具栏
  aspectRatio: 1, // 设置日历单元格宽度与高度的比例
  locale: 'zh-cn', // 切换语言
  /** 事件（在日历上做标记） */
  events: timeCalendarEvents.value,
  /** 事件点击 */
  eventClick: clickCalendar,
  slotEventOverlap: false, // 事件重叠
})
/** 日历点击事件 */
function clickCalendar(value) {
  const data = sourceData.value.find(
    item => item.id === value.event.id,
  )
  router.push({
    path: '/appointment-management/add',
    query: data,
  })
}

/** 跳转到上个月 */
function prevMonth() {
  fullcalendarApi.value?.prev()
  monthPicker.value = dayjs(fullcalendarApi.value?.getDate())
  getVisibleDates()
}
/** 跳转到下个月 */
function nextMonth() {
  fullcalendarApi.value?.next()
  monthPicker.value = dayjs(fullcalendarApi.value?.getDate())
  getVisibleDates()
}

async function getVisibleDates() {
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi()
    const view = calendarApi.view
    const start = view.activeStart
    const end = view.activeEnd
    const resStartDate = dayjs(start).format('YYYY-MM-DD 00:00:00')
    const resEndDate = dayjs(end).format('YYYY-MM-DD 23:59:59')
    const { data } = await getHumitureResList({
      'page': 1,
      'size': 999,
      resStartDate,
      resEndDate,
      'notBackIssue': false,
      'laboratory.id': props.selectedLaboratory?.[0],
    })
    sourceData.value = data.rows || []
    eventsArr.value = data?.rows?.map((item) => {
      // 判断是否过期
      const isOverTime = dayjs(item.startDate).isBefore(dayjs())
      return {
        id: item.id,
        title: `${dayjs(item.startDate).format('HH:mm')}-${item.testSampleDisplayName || '-'}`,
        start: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
        end: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
        color: item.status === 'OPEN' && !isOverTime ? '#24B276' : '#707C8C',
        textColor: item.status === 'OPEN' && !isOverTime ? '#224059' : '#707C8C',
        isOverTime,
        status: item.status,
      }
    })
    timeCalendarEvents.value = data?.rows?.map((item) => {
      // 判断是否过期
      const isOverTime = dayjs(item.startDate).isBefore(dayjs())
      return {
        id: item.id,
        // eslint-disable-next-line vue/max-len
        title: `${item.createName} ${dayjs(item.startDate).format('MM-DD HH:mm')} ~ ${dayjs(item.endDate).format('MM-DD HH:mm')} ${item.testSampleDisplayName || ''}`,
        start: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
        end: dayjs(item.startDate).format('YYYY-MM-DD HH:mm:ss'),
        color: item.status === 'OPEN' && !isOverTime ? '#24B276' : '#707C8C',
        textColor: item.status === 'OPEN' && !isOverTime ? '#224059' : '#707C8C',
        isOverTime,
        status: item.status,
      }
    })
  }
}

/**
 * # 平滑滚动到传入id所在节点
 * @param id 节点id
 */
function scrollTo(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}

onMounted(() => {
  /** getApi可以获取日历里的方法 */
  fullcalendarApi.value = Object.getOwnPropertyDescriptor(
    fullCalendarRef.value,
    'getApi',
  )?.value()
  fullcalendarTimeApi.value = Object.getOwnPropertyDescriptor(
    fullCalendarTimeRef.value,
    'getApi',
  )?.value()
  getVisibleDates()
  watch(() => props.selectedLaboratory, () => {
    getVisibleDates()
  }, { deep: true })
  watch(() => eventsArr.value, (val) => {
    calendarOptions.value.events = val
    fullcalendarApi.value?.refetchEvents()
  }, {
    immediate: true,
    deep: true,
  })
  watch(() => timeCalendarEvents.value, (val) => {
    timeCalendarOptions.value.events = val
    fullcalendarTimeApi.value?.refetchEvents()
  }, {
    immediate: true,
    deep: true,
  })
})
</script>

<style scoped lang="less">
:deep(.fc .fc-col-header-cell-cushion) {
  font-weight: normal;
}
:deep(.fc .fc-daygrid-day-number) {
  font-weight: normal;
}
:deep(.fc .fc-scrollgrid-section > *) {
  border-width: 0px;
}
:deep(.fc .fc-scrollgrid-section-sticky) {
  & > * {
    background-color: transparent;
    padding: 12px 0;
  }
}
:deep(.fc-daygrid-day-top) {
  flex-direction: unset;
  justify-content: center;
}
:deep(.fc-day-today) {
  background-color: transparent !important;
}
:deep(.fc-day-today .fc-daygrid-day-number) {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #0066ec !important;
  color: #fff;
}
:deep(.fc-theme-standard th) {
  border: none !important;
  // border-bottom: 1px solid #fff !important;
}
:deep(.fc-theme-standard .fc-scrollgrid) {
  border: none !important;
}
:deep(.custom-hightlight) {
  background-color: #a9cbf1 !important;
  border-radius: 4px;
}
:deep(.fc .fc-timegrid-slot) {
  height: 36px;
}
:deep(.fc .fc-scrollgrid table) {
  border-top-style: unset !important;
}
:deep(.fc-popover) {
  left: 50% !important;
  transform: translateX(-50%);
}

.customFullCalendar {
  --fc-border-color: #fff;
  :deep(.fc-event) {
    font-size: 5px !important;
    display: flex;
    align-items: center;
    height: 10px !important;
    line-height: 10px !important;
    pointer-events: none;
    // transform: scale(0.5);
  }

  :deep(.fc-popover .fc-event) {
    font-size: 10px !important;
    height: 14px !important;
    line-height: 14px !important;
  }
  :deep(.fc-more-link) {
    font-size: 5px;
  }
  :deep(.fc-event-title) {
    font-weight: 400 !important;
    white-space: nowrap;
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
  }
  :deep(.fc-daygrid-day-events) {
    margin-bottom: unset !important;
  }
}
:deep(.fc-popover-header) {
  background-color: #f2f4fb !important;
  border-bottom: 1px solid #fff;
}
:deep(.fc-theme-standard .fc-popover) {
  background-color: #f2f4fb !important;
  border-radius: 8px;
  overflow: hidden;
}
:deep(.fc-direction-ltr .fc-timegrid-col-events) {
  margin: unset !important;
}
.timeCalendar {
  --fc-border-color: transparent;
  --fc-more-link-bg-color: #7fb5ed;
  :deep(.fc-v-event) {
    background: rgba(0, 102, 236, 0.2) !important;
    color: #0066ec;
    font-size: 7px !important;
    border: unset;
    .fc-event-main {
      color: #0066ec;
    }
  }

  :deep(.fc-timegrid-slot-label-cushion) {
    padding-left: 0;
    padding-right: 12px;
  }
  :deep(.fc-timegrid-more-link) {
    padding: 0 6px;
    transform: translateY(-4px);
  }
  :deep(.fc-timegrid-event-harness-inset .fc-timegrid-event) {
    box-shadow: unset;
  }
  :deep(.fc-v-event .fc-event-main-frame) {
    padding: 0 6px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  :deep(.fc-event-time) {
    margin: unset;
    margin-right: 4px;
    font-size: 1em;
  }

  :deep(.fc-scrollgrid-shrink-cushion) {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 0;
      transform: translate(100%, -50%);
      display: inline-block;
      width: 100vw;
      height: 0.5px;
      background-color: #fff;
    }
  }
}
:deep(.van-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid #ffffff;
}
</style>
