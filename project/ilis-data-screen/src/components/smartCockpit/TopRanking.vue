<template>
  <div class="h-full text-white flex flex-col pt-30 top-ranking">
    <ul v-if="header.length" class="flex text-[0.36rem] top-ranking-header">
      <li class="!pl-40">排名</li>
      <li v-for="d in header" :key="d.key">{{ d.title }}</li>
    </ul>
    <div class="flex-1 h-0 overflow-y-auto overflow-x-hidden">
      <div
        v-for="(d, i) in dataList"
        :key="i"
        class="text-[0.28rem] flex flex-col justify-end min-h-1/5"
      >
        <ul class="flex items-center" style="margin-bottom: -0.1rem">
          <li :class="`top-${i + 1} !pl-40`">TOP{{ i + 1 }}</li>
          <template v-if="header.length">
            <li v-for="h in header" :key="h.key">
              <div>
                <slot :name="h.key" :item="d">{{ d[h.key] }}</slot>
              </div>
            </li>
          </template>
        </ul>
        <Progress
          :percent="d.customShowPercent || d.showPercent"
          :size="6"
          :show-info="false"
          :stroke-color="strokeColor(i)"
        />
      </div>
      <NoData v-if="!loading && dataList.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Progress } from "ant-design-vue"
import { watch, ref } from "vue"
import NoData from "./NoData.vue"

export interface TopRankingHead {
  title: string
  key: string
  /** 标识数值字段：不传时默认取header中最后一项 */
  isValue?: boolean
}

const props = withDefaults(
  defineProps<{
    header: TopRankingHead[]
    datas: Record<string, any>[]
    sort?: "desc" | "asc"
    loading: boolean
  }>(),
  {
    header: () => [],
    datas: () => [],
    loading: false,
    sort: "desc"
  }
)

function strokeColor(ind: number) {
  return ind === 0
    ? {
        from: "#F39052",
        to: "#F3BC52"
      }
    : {
        from: "#0BFFFF",
        to: "#40E7D5"
      }
}

const dataList = ref<any[]>([])
watch(
  () => props.datas,
  (datas) => {
    if (!datas.length) {
      dataList.value = []
      return
    }
    const valueKey =
      props.header.find((item) => item.isValue)?.key || props.header[props.header.length - 1].key
    const list: any[] = []
    if (props.sort === "asc") {
      datas.sort((a, b) => a[valueKey] - b[valueKey])
    } else {
      datas.sort((a, b) => b[valueKey] - a[valueKey])
    }
    const max = datas[0][valueKey]
    for (let i = 0; i < datas.length; i++) {
      const item = datas[i]
      list.push({
        ...item,
        percent: (item[valueKey] / max) * 100,
        showPercent: 0
      })
    }
    dataList.value = list
    dataList.value.forEach(transitonPercent)
  },
  {
    immediate: true
  }
)

function transitonPercent(item: any) {
  const start = performance.now()
  const initialPercent = 0

  const easeOutQuad = (t: number) => 1 + --t * t
  function animate() {
    const now = performance.now()
    let progress = (now - start) / 2000

    if (progress >= 1) {
      item.showPercent = item.percent
      return
    }

    const easedProgress = easeOutQuad(progress)
    item.showPercent = Math.min(
      initialPercent + (item.percent - initialPercent) * easedProgress,
      item.percent
    )

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}
</script>

<style scoped lang="less">
.top-ranking {
  ul li {
    flex: 1;
    width: 0;
    &.top-1 {
      background: linear-gradient(180deg, #ffffff 0%, #ffd15c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
      color: #ffd15c;
    }
    &.top-3 {
      background: linear-gradient(180deg, #ffffff 0%, #c54613 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
      color: #c54613;
    }
    &:first-child {
      flex: inherit;
      width: 3rem;
      font-weight: bold;
    }
    &:last-child {
      flex: inherit;
      width: 3rem;
      text-align: center;
    }
  }
}
.top-ranking-header {
  margin-bottom: 0.3rem;
  padding: 0.06rem 0;
  position: relative;
  overflow: hidden;
  &::after {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0.4rem;
    content: "";
    background: linear-gradient(270deg, rgba(11, 255, 255, 0), #0bffff);
    filter: blur(0.06rem);
  }
}
.ant-progress-line {
  margin-bottom: 0;
  margin-inline-end: 0;
}
</style>
