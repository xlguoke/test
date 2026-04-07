<template>
  <div>
    <van-overlay :show="loading" />

    <HomeSampleRoom hidden-title />

    <CommonTabs :tabs="tabs" @change="changeTab" />

    <CommonSearch placeholder="请输入样品名称、样品编号查询" @search="onSearch" />

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="getList"
    >
      <Container v-for="d in dataList" :key="d.id" class="detail-data-list">
        <div class="sample-name flex w-full mb-[0.12rem]">
          <span v-if="d.bigCategoryName" class="mark">
            <span class="text">{{ d.bigCategoryName }}</span>
          </span>
          <span class="w-0 flex-1 mr-[0.5rem]">{{ d.testObjectCode }}</span>
        </div>
        <CommonLine
          label="样品名称："
          :value="d.testSampleDisplayName"
          align="left"
          label-width="1.2rem"
        />
        <CommonLine label="规格型号：" :value="d.standard" align="left" label-width="1.2rem" />
        <CommonLine label="样品数量：" :value="d.sampleNum" align="left" label-width="1.2rem" />
        <template v-if="d.type === '0'">
          <CommonLine label="领用人员：" :value="d.operator" align="left" label-width="1.2rem" />
          <CommonLine
            label="任务编号："
            :value="d.testTaskCode"
            align="left"
            label-width="1.2rem"
          />
          <CommonLine
            label="领用时间："
            :value="d.operationTime"
            align="left"
            label-width="1.2rem"
          />
        </template>
        <template v-else>
          <CommonLine label="入库人员：" :value="d.operator" align="left" label-width="1.2rem" />
          <CommonLine
            label="入库时间："
            :value="d.operationTime"
            align="left"
            label-width="1.2rem"
          />
          <CommonLine label="存放地点：" align="left" label-width="1.2rem">
            <template #value>
              <span>{{ d.laboratoryName }}</span>
              <span v-if="d.laboratoryName && d.saveSite">-</span>
              <span>{{ d.saveSite }}</span>
            </template>
          </CommonLine>
        </template>

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
import HomeSampleRoom from "../home/components/HomeSampleRoom.vue"
import CommonTabs from "../../components/CommonTabs.vue"
import CommonSearch from "../../components/CommonSearch.vue"
import CommonLine from "../../components/CommonLine.vue"
import Container from "../../components/Container.vue"
import { SampleRoomData } from "@/types/functionRoome2"
import { sampleRoomDetailApi } from "@/api/functionRoom2.api"
import { usePageList } from "../../composables/usePageList"
import { useDateFormat } from "@vueuse/core"

const tabs = ref([
  { label: "全部", value: "ALL" },
  { label: "出库", value: "OUT" },
  { label: "入库", value: "IN" }
])
const statusObj = {
  1: "出库",
  2: "入库"
}
const query = ref({
  queryType: "ALL"
})

function initDate(t): any {
  return t ? useDateFormat(t, "YYYY-MM-DD").value : ""
}

const { loading, finished, dataList, onSearch, getList, initData } = usePageList<SampleRoomData>({
  api: sampleRoomDetailApi,
  query,
  beforeTransofrmResponse(rows) {
    rows.forEach((d) => {
      d.operationTime = initDate(d.operationTime)
      d.status = initStatus(d)
    })
    return rows
  }
})

function changeTab(item) {
  query.value.queryType = item.value
  initData()
}
/**
 * 初始化状态信息
 */
function initStatus(item: SampleRoomData) {
  if (item.type === "0") return "1"
  return "2"
}
</script>

<style scoped lang="less">
@import "../commonRoomeDetail.less";
</style>
