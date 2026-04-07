<template>
  <ComCard
    v-model:checked="filterValue"
    :title="title"
    :filter-options="filterOptions"
    filter-type="select"
    @select="getData"
  >
    <div id="use-status-box" class="use-status-box">
      <div :class="`scroll-box ${moveLab ? 'startMove' : ''}`">
        <ul v-for="(item, i) in data" :key="i" class="use-status-list clearfix">
          <li v-for="d in item" :key="d.id" class="item item-normal">
            <p :class="`lab-name font-1`">
              {{ d?.labName }}
            </p>
            <p :class="`item-status ${d?.isOutDate && d?.temperature ? 'middle-line' : ''}`">
              <span class="wendu">{{ d?.temperature ? `${d?.temperature}℃` : "--" }}</span>
              <span class="shidu">{{ d?.humidity ? `${d?.humidity}%RH` : "--" }}</span>
            </p>
          </li>
        </ul>
      </div>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import { labEnvironment } from "@/api/dataScreen.api"
import ComCard from "@/components/ComCard.vue"
import { useUnitDataHooks } from "@/hooks/useUnitDataHooks"
import { autoPlayData } from "@/utils/screenUtils"
import { computed, ref } from "vue"

// 功能室使用情况
interface testRoomType {
  id: string
  humidity: string
  labName: string
  recordTime: string
  temperature: string
  isOutDate: boolean
}

const data = ref<testRoomType[][]>([])

const filterValue = ref("")

const { unitCode } = useUnitDataHooks()

const filterOptions = computed(() => {
  if (unitCode.value === "ztlq") {
    return [
      { label: "全部", value: "" },
      { label: "一级", value: "一级" },
      { label: "二级", value: "二级" },
      { label: "三级", value: "三级" }
    ]
  }
  return []
})

const title = computed(() => {
  return unitCode.value === "ztlq" ? "功能室温湿度监控要求" : "功能室温湿度监控"
})

const moveLab = ref(false)

const labTimer = ref()

const getData = () => {
  labEnvironment(filterValue.value || undefined).then((res) => {
    if (res.code !== 20000) return
    const labs = res.data
    const newArr: testRoomType[][] = []
    let rowArr: testRoomType[] = []
    const nowDate = new Date().getTime()
    for (let i = 0; i < labs.length; i++) {
      const item = labs[i]
      if (item.recordTime) {
        const t = nowDate - item.recordTime
        item.isOutDate = t >= 2 * 60 * 60 * 1000
      } else {
        item.isOutDate = false
      }
      if (i > 0 && i % 2 === 0) {
        newArr.push(rowArr)
        rowArr = []
      }
      if (i === labs.length - 1 && i % 2 !== 0) {
        newArr.push(rowArr)
      }
      rowArr.push(item)
    }

    if (newArr.length === 0 && labs.length === 1) {
      newArr.push([labs[0]])
      labTimer.value && clearInterval(labTimer.value)
    }
    data.value = newArr
    autoPlayData({
      domId: "use-status-box",
      datas: data,
      isMove: moveLab,
      timer: labTimer,
      callback: (list) => {
        if (list) {
          const nowDate = new Date().getTime()
          for (let i = 0; i < list.length; i++) {
            if (list[i].recordTime) {
              const t = nowDate - list[i].recordTime
              list[i].isOutDate = t >= 2 * 60 * 60 * 1000
            } else {
              list[i].isOutDate = false
            }
          }
        }
      }
    })
  })
}

getData()

defineExpose({
  getData
})
</script>
<style lang="less" scoped>
.use-status-box {
  overflow: hidden;
  height: 100%;
  .startMove {
    transition: 0.9s ease-out;
    transform: translateY(-0.86rem);
    &.broad-beam {
      transform: translateY(-0.65rem);
    }
  }
  .use-status-list {
    color: #1890ff;
    font-size: 0.14rem;
    display: flex;
    flex-wrap: wrap;
    &:last-child .item {
      margin-bottom: 0;
    }
    .item {
      padding: 0 0.1rem;
      width: calc(50% - 0.05rem);
      border-top: 1px solid #1890ff;
      box-sizing: border-box;
      background: linear-gradient(180deg, rgba(34, 155, 255, 0) 0%, rgba(34, 155, 255, 0.19) 100%);
      &:nth-child(2n) {
        margin-left: 0.1rem;
      }
    }
    .item-broad-beam {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 0.55rem;
      margin-bottom: 0.09rem;

      .lab-name {
        padding-right: 2px;
      }
      .middle-line span {
        text-decoration: line-through;
      }
    }
    .item-normal {
      height: 0.74rem;
      margin-top: 0.02rem;
      margin-bottom: 0.1rem;
      .lab-name {
        padding: 0.08rem 0;
        margin-bottom: 0;
      }
      .item-status {
        padding-top: 0.06rem;
        width: 100%;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        border-left: none;
      }
    }
    .item-status {
      display: flex;
      row-gap: 0.1rem;
      width: 60%;
      min-width: 60%;
      line-height: 0.25rem;
      border-left: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      .wendu {
        flex: 1;
        padding-left: 0.24rem;
        background: url("@/assets/images/wendu.png") no-repeat 0 center/ 22px 16px;
      }
      .shidu {
        flex: 1;
        padding-left: 0.24rem;
        background: url("@/assets/images/shidu.png") no-repeat 0 center/ 18px 16px;
      }
    }
  }
}
</style>
