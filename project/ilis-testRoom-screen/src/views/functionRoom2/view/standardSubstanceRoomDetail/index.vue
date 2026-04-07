<template>
  <div>
    <van-overlay :show="loading" />

    <HomeStandardSubstanceRoom hidden-title />

    <CommonTabs :tabs="tabs" @change="changeTab" />

    <CommonSearch placeholder="请输入标准物质名称查询" @search="onSearch" />

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="getList"
    >
      <Container v-for="d in dataList" :key="d.id" class="detail-data-list">
        <div class="sample-name w-full mb-[0.12rem] mr-[0.5rem]">
          {{ d.name }}
        </div>
        <CommonLine label="耗材类别：" :value="d.type" align="left" label-width="1.2rem" />
        <CommonLine label="所属部门：" :value="d.depart" align="left" label-width="1.5rem" />
        <CommonLine label="型号：" :value="d.standard" align="left" label-width="1.2rem" />
        <CommonLine label="数量：" :value="d.amount" align="left" label-width="1.5rem" />
        <CommonLine label="存放地点：" :value="d.site" align="left" label-width="1.2rem" />
        <CommonLine
          :label="`${d.recordType === '1' ? '入库' : '出库'}经手人：`"
          :value="d.operatorName"
          align="left"
          label-width="1.5rem"
        />
        <CommonLine
          :label="`${d.recordType === '1' ? '入库' : '出库'}时间：`"
          :value="d.recordDate"
          align="left"
          label-width="1.2rem"
        />
        <CommonLine
          :label="`${d.recordType === '1' ? '入库' : '出库'}数量：`"
          :value="d.amountWithUnit"
          align="left"
          label-width="1.5rem"
        />

        <div
          v-if="d.status"
          :class="{
            'data-status': true,
            [`status-${d.status}`]: !!d.status
          }"
        >
          {{ statusObj[d.status] }}
        </div>
      </Container>
    </van-list>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import HomeStandardSubstanceRoom from "../home/components/HomeStandardSubstanceRoom.vue"
import CommonTabs from "../../components/CommonTabs.vue"
import CommonSearch from "../../components/CommonSearch.vue"
import CommonLine from "../../components/CommonLine.vue"
import Container from "../../components/Container.vue"
import { StandardSubstanceRoomData } from "@/types/functionRoome2"
import { standardSubstanceRoomDetailApi } from "@/api/functionRoom2.api"
import { usePageList } from "../../composables/usePageList"
import { useDateFormat } from "@vueuse/core"

const tabs = ref([
  { label: "全部", value: "all" },
  { label: "近三月出库", value: "出库" },
  { label: "近三月入库", value: "入库" }
])
const statusObj = {
  2: "入库",
  4: "出库"
}
const query = ref<{
  inventoryType?: "1" | "2" // 1入库 2出库
  operationTimeStart?: string
  operationTimeEnd?: string
  orderBy: string
  order: "desc" | "asc"
}>({
  orderBy: "recordDate",
  order: "desc"
})

function initDate(t) {
  return t ? useDateFormat(t, "YYYY-MM-DD").value : ""
}

const { loading, finished, dataList, onSearch, getList, initData } =
  usePageList<StandardSubstanceRoomData>({
    api: standardSubstanceRoomDetailApi,
    query,
    beforeTransofrmResponse(rows) {
      rows.forEach((d) => {
        d.amount = d.amount ? `${d.amount}${d.amountUnit || ""}` : ""
        d.status = initStatus(d)
      })
      return rows
    }
  })

/** 近三月日期 */
const nowDate = Date.now()
const threeMonth = [initDate(new Date(nowDate - 90 * 24 * 3600000)), initDate(nowDate)]

function changeTab(item) {
  if (item.value === "all") {
    query.value = {
      orderBy: "recordDate",
      order: "desc"
    }
  } else {
    query.value.inventoryType = item.value
    query.value.operationTimeStart = threeMonth[0] + " 00:00:00"
    query.value.operationTimeEnd = threeMonth[1] + " 23:59:59"
  }
  initData()
}
/**
 * 初始化状态信息
 */
function initStatus(item: StandardSubstanceRoomData) {
  if (item.recordType === "2") {
    return "4"
  } else if (item.recordType === "1") {
    return "2"
  }
  return ""
}
</script>

<style scoped lang="less">
@import "../commonRoomeDetail.less";
</style>
