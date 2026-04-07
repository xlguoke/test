<template>
  <div class="in-out-record">
    <TableTitle>人员进出记录</TableTitle>
    <div class="content">
      <div class="l">
        <div class="desc">
          <img src="@/assets/images/cutRoomScreen/stay.svg" alt="" />
          <div class="count">
            <div class="num">{{ dateData ?? "--" }}</div>
            <div class="label">今日进入人次</div>
          </div>
        </div>
        <div class="desc">
          <img src="@/assets/images/cutRoomScreen/in.svg" alt="" />
          <div class="count">
            <div class="num">{{ monthData ?? "--" }}</div>
            <div class="label">本月进入人次</div>
          </div>
        </div>
      </div>
      <div ref="container" class="r">
        <CustomTable
          :key="tableKey"
          :data-source="data"
          :columns="columns"
          :pagination="false"
          :scroll="{
            y: getY()
          }"
        ></CustomTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TableTitle from "./TableTitle.vue"
import CustomTable from "./CustomTable.vue"
import { onMounted, ref } from "vue"
import { InOutRecordEntity } from ".."
import { formatDate } from "@/utils/utils"
import { table } from "console"

defineProps<{
  data: InOutRecordEntity[]
  dateData: number
  monthData: number
}>()

const container = ref<HTMLElement>()
const tableKey = ref(0)
const columns = ref([
  {
    title: "人员姓名",
    dataIndex: "PersonName",
    key: "PersonName",
    ellipsis: true
  },
  {
    // 这一列用来占位
    title: "",
    dataIndex: "Statusss",
    key: "Statusss",
    ellipsis: true
  },
  {
    title: "进入时间",
    dataIndex: "EventTime",
    key: "EventTime",
    ellipsis: true,
    customRender: ({ text, record }) => {
      if (!text) return "--"
      return formatDate(text, 2)
    }
  }
])
function getY() {
  return (container.value?.clientHeight && container.value?.clientHeight - 80) ?? 300
}
onMounted(() => {
  setTimeout(() => {
    tableKey.value++
  }, 300)
})
</script>

<style lang="less" scoped>
.in-out-record {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  border: 1px solid #032c6c;
  background: rgba(8, 107, 237, 0.1);
  gap: 16px;
  .content {
    height: 100%;
    display: flex;
    gap: 24px;
    .l {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      img {
        width: 200px;
        height: 78px;
      }
    }
    .r {
      flex: 1;
      height: 0;
    }
    .desc {
      position: relative;
      color: #c5ecff;
      font-size: 14px;
      .count {
        position: absolute;
        top: 0;
        right: 30px;
        .num {
          font-family: YSFont;
          font-size: 30px;
          background: linear-gradient(0deg, #87daff 0%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
      }
    }
  }
}
</style>
