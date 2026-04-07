<template>
  <div class="pt-30 h-full text-white data-table-wrap">
    <ul class="table-head">
      <li class="table-tr">
        <div
          v-for="head in columns"
          :key="head.key"
          :class="`text-${head.align || 'center'} table-td`"
          :style="{ width: head.width || '0', flex: head.width ? 'inherit' : 1 }"
        >
          {{ head.title }}
        </div>
      </li>
    </ul>
    <div ref="tableBodyRef" class="table-body-scroll">
      <ul :class="`table-body !mb-0 ${moveTo ? 'move-to' : ''}`">
        <li
          v-for="(d, i) in dataList"
          :key="i"
          class="table-tr"
          :class="{
            'tr-first': d.isFirst,
            'tr-active': !!checkIdField && d[checkIdField] === checkedId
          }"
          @click="handleRowClick(d)"
        >
          <div
            v-for="head in columns"
            :key="head.key"
            :class="`text-${head.align || 'center'} table-td`"
            :style="{ width: head.width || '0', flex: head.width ? 'inherit' : 1 }"
          >
            <slot :name="head.key" :item="d">
              {{ d[head.key] || "" }}
            </slot>
          </div>
        </li>
      </ul>
      <NoData v-if="!loading && dataList.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { deepCopy } from "@/utils/utils"
import { nextTick, ref, watch } from "vue"
import { onBeforeRouteLeave } from "vue-router"
import NoData from "./NoData.vue"

export interface DataTableHead {
  title: string
  key: string
  align?: "left" | "center" | "right"
  width?: string
}

const props = withDefaults(
  defineProps<{
    columns: DataTableHead[]
    datas: Record<string, any>[]
    loading: boolean
    // 轮播完成的回调
    onEnd?: (d: any[]) => void
    isDeepList?: boolean
    checkIdField?: string
  }>(),
  {
    columns: () => [],
    datas: () => [],
    loading: false,
    onEnd: undefined,
    isDeepList: true,
    checkIdField: undefined
  }
)
const emits = defineEmits(["row-click"])

const dataList = ref<Record<string, any>[]>([])

const checkedId = ref()

watch(
  () => props.datas,
  (datas) => {
    checkedId.value = undefined

    dataList.value = props.isDeepList ? deepCopy(datas) : datas
    if (!datas.length) return
    // 标识第一个元素，获取其位置判断是否轮播完
    dataList.value[0].isFirst = true
    nextTick(() => {
      autoPlayData()
    })
  },
  {
    deep: props.isDeepList
  }
)

let timer: any = null
// 滚动延迟
const delay = 5000
const moveTo = ref(false)
const tableBodyRef = ref()
// 轮播
function autoPlayData() {
  const scroll = tableBodyRef.value
  const content = scroll.querySelector(".table-body") as HTMLElement
  const scrollHeight = scroll.offsetHeight
  const contentHeight = content.offsetHeight

  if (scrollHeight >= contentHeight) {
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      props.onEnd && props.onEnd(dataList.value)
    }, delay)
    return
  }

  timer && clearInterval(timer)
  timer = setInterval(() => {
    moveTo.value = true
    const row = content.querySelector(".table-tr") as HTMLElement
    const height = row.offsetHeight
    content.style.transform = `translateY(-${height}px)`

    setTimeout(() => {
      moveTo.value = false
      nextTick(() => {
        const first = dataList.value.shift() as any
        dataList.value.push(first)
        content.style.transform = `translateY(0)`

        // 获取初始的第一条数据位置
        const firstRow = content.querySelector(".tr-first") as HTMLElement
        const firstTop = firstRow.offsetTop || 0
        if (props.onEnd && firstTop > 0 && firstTop <= scrollHeight) {
          clearInterval(timer.value)
          props.onEnd(dataList.value)
        }
      })
    }, 1000)
  }, delay)
}
function handleRowClick(rowData: any) {
  if (props.checkIdField) {
    if (checkedId.value === rowData[props.checkIdField]) {
      checkedId.value = undefined
      emits("row-click", undefined)
    } else {
      checkedId.value = rowData[props.checkIdField]
      emits("row-click", rowData)
    }
  } else {
    emits("row-click", rowData)
  }
}

onBeforeRouteLeave(() => {
  timer && clearInterval(timer)
})
</script>

<style scoped lang="less">
.data-table-wrap {
  .table-head {
    margin-bottom: 0.2rem;
    .table-tr {
      background-color: rgba(64, 231, 214, 0.1);
      min-height: 0.96rem;
    }
  }
  .table-body-scroll {
    margin-top: 0.04rem;
    height: calc(100% - 1.2rem);
    overflow-y: hidden;
    .table-body {
      line-height: 0.4rem;
      &.move-to {
        transition: 1s ease-in-out;
      }
      .table-tr {
        padding-bottom: 0.04rem;
        min-height: 0.86rem;
      }
      .table-td {
        background-color: rgba(64, 231, 214, 0.04);
      }
    }
  }
  .table-tr {
    display: flex;
    .table-td {
      padding: 0.1rem 0.3rem;
      display: flex;
      align-items: center;
      word-break: break-all;
    }
  }

  .tr-active {
    background: rgba(64, 231, 213, 0.2);
  }

  .text-left {
    justify-content: flex-start;
  }
  .text-center {
    justify-content: center;
  }
  .text-right {
    justify-content: flex-end;
  }
}
</style>
