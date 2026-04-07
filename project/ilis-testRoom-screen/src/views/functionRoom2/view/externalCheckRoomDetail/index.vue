<template>
  <div>
    <van-overlay :show="loading" />

    <HomeExternalCheckRoom hidden-title />

    <CommonTabs :tabs="tabs" @change="changeTab" />

    <CommonSearch placeholder="请输入设备名称、设备编号查询" @search="onSearch" />

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="getList"
    >
      <Container v-for="d in dataList" :key="d.egressId" class="detail-data-list">
        <div class="sample-name w-full mb-[0.12rem] mr-[0.5rem]">
          {{ d.name }}
        </div>
        <CommonLine label="设备编号：" :value="d.equipmentSn" align="left" label-width="1.2rem" />
        <CommonLine label="规格型号：" :value="d.standard" align="left" label-width="1.2rem" />
        <CommonLine label="量程：" :value="d.eqRange" align="left" label-width="1.2rem" />
        <CommonLine label="精度：" :value="d.accuracy" align="left" label-width="1.2rem" />
        <template v-if="d.egressId">
          <CommonLine label="外出时间：" :value="d.egressTime" align="left" label-width="1.2rem" />
          <CommonLine
            label="预还时间："
            :value="d.expectReturnTime"
            align="left"
            label-width="1.2rem"
          />
          <CommonLine label="借用人：" :value="d.borrowUser" align="left" label-width="1.2rem" />
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
import HomeExternalCheckRoom from "../home/components/HomeExternalCheckRoom.vue"
import CommonTabs from "../../components/CommonTabs.vue"
import CommonSearch from "../../components/CommonSearch.vue"
import CommonLine from "../../components/CommonLine.vue"
import Container from "../../components/Container.vue"
import { ExternalCheckRoomData } from "@/types/functionRoome2"
import { externalCheckRoomDetailApi } from "@/api/functionRoom2.api"
import { usePageList } from "../../composables/usePageList"
import { useDateFormat } from "@vueuse/core"

const tabs = ref([
  { label: "全部", value: "ALL" },
  { label: "留存", value: "INVENTORY" },
  { label: "外出", value: "EGRESS" }
])
const statusObj = {
  2: "外出",
  4: "归还超期"
}
const query = ref<{
  queryType?: string
}>({})

function initDate(t, format?: string): any {
  return t ? useDateFormat(t, format || "YYYY-MM-DD").value : ""
}

const { loading, finished, dataList, onSearch, getList, initData } =
  usePageList<ExternalCheckRoomData>({
    api: externalCheckRoomDetailApi,
    query,
    beforeTransofrmResponse(rows) {
      rows.forEach((d) => {
        d.egressTime = initDate(d.egressTime, "YYYY-MM-DD HH:mm:ss")
        d.expectReturnTime = initDate(d.expectReturnTime)
        d.status = initStatus(d)
      })
      return rows
    }
  })

function changeTab(item) {
  query.value.queryType = item.value
  initData()
}

const nowTime = new Date(initDate(Date.now())).getTime()

/**
 * 初始化状态信息
 */
function initStatus(item: ExternalCheckRoomData) {
  if (!item.egressId || !item.expectReturnTime) {
    if (item.egressId) return "2"
    return ""
  }
  if (nowTime >= new Date(item.expectReturnTime).getTime()) return "4"
  return "2"
}
</script>

<style scoped lang="less">
@import "../commonRoomeDetail.less";
</style>
