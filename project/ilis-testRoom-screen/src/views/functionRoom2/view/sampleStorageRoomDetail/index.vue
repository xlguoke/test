<template>
  <div>
    <van-overlay :show="loading" />

    <HomeSampleStorageRoom hidden-title />

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
        <CommonLine label="规格型号：" :value="d.standard" align="left" label-width="1.5rem" />
        <CommonLine label="样品数量：" :value="d.sampleNum" align="left" label-width="1.2rem" />
        <CommonLine label="留样人：" :value="d.inOperator" align="left" label-width="1.5rem" />
        <CommonLine label="留样日期：" :value="d.reserveTime" align="left" label-width="1.2rem" />
        <CommonLine
          label="留样到期日期："
          :value="d.reserveOverDue"
          align="left"
          label-width="1.5rem"
        />
        <CommonLine label="留样数量：" :value="d.inAmount" align="left" label-width="1.2rem" />
        <CommonLine label="留样地点：" align="left" label-width="1.5rem">
          <template #value>
            <span>{{ d.laboratoryName }}</span>
            <span v-if="d.laboratoryName && d.inSaveSite">-</span>
            <span>{{ d.inSaveSite }}</span>
          </template>
        </CommonLine>

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
import HomeSampleStorageRoom from "../home/components/HomeSampleStorageRoom.vue"
import CommonTabs from "../../components/CommonTabs.vue"
import CommonSearch from "../../components/CommonSearch.vue"
import CommonLine from "../../components/CommonLine.vue"
import Container from "../../components/Container.vue"
import { SampleStorageRoomData, SampleStorageRoomQueryTypeEnum } from "@/types/functionRoome2"
import { sampleStorageRoomDetailApi } from "@/api/functionRoom2.api"
import { useDateFormat } from "@vueuse/core"
import { usePageList } from "../../composables/usePageList"

const tabs = ref([
  { label: "全部", value: SampleStorageRoomQueryTypeEnum.ALL },
  { label: "即将到期", value: SampleStorageRoomQueryTypeEnum.SEVEN_DAY_EXPIRE },
  { label: "已到期", value: SampleStorageRoomQueryTypeEnum.EXPIRED }
])
const query = ref({
  queryType: SampleStorageRoomQueryTypeEnum.ALL
})

const { loading, finished, dataList, onSearch, getList, initData } =
  usePageList<SampleStorageRoomData>({
    api: sampleStorageRoomDetailApi,
    query,
    beforeTransofrmResponse(rows) {
      rows.forEach((d) => {
        d.reserveTime = initDate(d.reserveTime)
        d.reserveOverDue = initDate(d.reserveOverDue)
        d.status = initStatus(d)
      })
      return rows
    }
  })

function changeTab(item) {
  query.value.queryType = item.value
  initData()
}

// 格式化日期
function initDate(t): any {
  return t ? useDateFormat(t, "YYYY-MM-DD").value : ""
}

const sevenDay = 7 * 24 * 3600000 // 七天的毫秒数
const now = Date.now() // 当前时间戳
const nowDate = initDate(now) // 当前日期字符串
const sevenDate = initDate(now + sevenDay) // 七天后的日期字符串
const statusObj = {
  3: "即将到期",
  4: "已到期"
}
/**
 * 初始化状态信息
 */
function initStatus(item: SampleStorageRoomData) {
  if (!item.reserveOverDue) return ""
  const e = new Date(item.reserveOverDue).getTime()
  let s = new Date(nowDate).getTime()
  if (s > e) return "4"
  s = new Date(sevenDate).getTime()
  if (s >= e) return "3"
  return ""
}
</script>

<style scoped lang="less">
@import "../commonRoomeDetail.less";
</style>
