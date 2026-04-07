<template>
  <div class="device-list-main">
    <van-swipe
      v-if="listData.length"
      :autoplay="screenConfig.frequencyCarousel ? screenConfig.frequencyCarousel * 1000 : 5000"
      lazy-render
      @change="handleChange"
    >
      <van-swipe-item v-for="(arr, index) in arrayResolve(swiperGroupNum, listData)" :key="index">
        <div class="item-box">
          <div
            v-for="(item, index2) in arr"
            :key="item.id"
            class="device-item"
            @click="handleDeviceClick(item)"
          >
            <DeviceItem :data="item" />
            <!-- <img class="split" src="@/assets/images/cutRoomScreen/splitLine.svg" alt="" /> -->
            <div class="subjoin">
              <DeviceTask
                v-if="item?.status === '正常' && dataList[index]?.[index2]?.id"
                :data="dataList[index]?.[index2] as TaskEntity"
              />
              <DeviceMaintance
                v-else-if="item?.status === '正在维修' && dataList[index]?.id"
                :data="dataList[index]?.[index2] as MaintanceEntity"
              />
              <Empty v-else />
            </div>
          </div>
        </div>
      </van-swipe-item>
    </van-swipe>
    <div class="swiper-pagination" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from "vue"
import { useRouter } from "vue-router"
import type { MaintanceEntity, TaskEntity } from ".."
import Empty from "./Empty.vue"
import DeviceItem from "./DeviceItem.vue"
import DeviceMaintance from "./DeviceMaintance.vue"
import DeviceTask from "./DeviceTask.vue"
import type { DeviceEntity } from "@/views/deviceSmallScreen/Home/DeviceEntity"
import { getDeviceMaintance, getDeviceTask } from "@/api/cutRoomScreen.api"
import { useStore } from "@/store"
import { useScreenHooks } from "@/hooks/useScreenHooks"

type DataType = TaskEntity | MaintanceEntity

const props = defineProps<{ listData: DeviceEntity[] }>()

const router = useRouter()

const { refreshData } = useScreenHooks()

const { screenConfig } = toRefs(useStore())

const swiperGroupNum = ref(4)

const realStartIndex = ref(0)

/**
 * # 当前设备列表的所有相关数据（任务/维修），每次滚动后更新当前展示的4条数据
 */
const dataList = ref(Array.from({ length: props.listData.length }) as DataType[])

let timer

// const splitArr = computed(() => {
//   console.log(arrayResolve(4, props.listData))

//   return arrayResolve(4, props.listData)
// })

function handleChange(index: any) {
  // 防抖执行数据更新
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    realStartIndex.value = index
  }, 500)
}

/**
 * 获取数据列表
 */
async function getDataList() {
  for (let i = realStartIndex.value; i < realStartIndex.value + swiperGroupNum.value; i++) {
    if (!props.listData[i]) continue
    const { id, status } = props.listData[i]
    if (status === "正常") {
      const { data, code } = await getDeviceTask(id)
      if (code === 20000) {
        dataList.value[i] = data[0] || {}
      }
    }
    if (status === "正在维修") {
      const { data, code } = await getDeviceMaintance(id)
      if (code === 20000) {
        dataList.value[i] = data || {}
      }
    }
  }
}

function handleDeviceClick(item: DeviceEntity) {
  if (!item.id) return
  router.push({ path: "/deviceSmallScreen", query: { ids: item.id, back: 1 } })
}

// 数组分解按传入n分解为二维数组
function arrayResolve(n: number, arr: any[]) {
  const result: any[] = []
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n))
  }
  return result
}

refreshData(getDataList)
</script>

<style lang="less" scoped>
.device-list-main {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 14px;
  .item-box {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 0.2rem;
    height: 4.6rem;
    font-size: 14px;
  }
  .device-item {
    position: relative;
    height: 4.3rem;
    overflow: hidden;
    padding: 0.2rem 0.12rem;
    font-size: 14px;
    color: #f4fcff;
    background: rgba(8, 107, 237, 0.1);
    border: 1px solid #032c6c;
    background-image: url("@/assets/images/cutRoomScreen/cornerTL.svg"),
      url("@/assets/images/cutRoomScreen/cornerTR.svg"),
      url("@/assets/images/cutRoomScreen/cornerBL.svg"),
      url("@/assets/images/cutRoomScreen/cornerBR.svg");
    background-repeat: no-repeat;
    background-position: top left, top right, bottom left, bottom right;
    .split {
      width: 100%;
    }
    .subjoin {
      height: 1.4rem;
    }
  }
}
// :deep(.van-swipe) {
//   overflow: unset;
// }
:deep(.van-swipe__indicators) {
  position: absolute;
  bottom: 0;
  // transform: translate(-50%, 100%);
  height: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  .van-swipe__indicator {
    cursor: pointer;
    display: inline-block;
    height: 4px;
    width: 10px;
    background: #003984;
    transition: width 0.3s;
    &--active {
      width: 24px;
      background: #086bed;
    }
  }
}
</style>
