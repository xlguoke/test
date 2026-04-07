<template>
  <div>
    <van-overlay :show="loading" />

    <HomeStandardRoom hidden-title />

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
        <CommonLine
          :label="`${d.operationType === '2' ? '出库' : '入库'}人员：`"
          :value="d.producer"
          align="left"
          label-width="1.2rem"
        />
        <CommonLine label="存放地点：" :value="d.saveSite" align="left" label-width="1.2rem" />
        <CommonLine
          :label="`${d.operationType === '2' ? '出库' : '入库'}日期：`"
          :value="d.operationDate"
          align="left"
          label-width="1.2rem"
        />
        <CommonLine label="龄期：" :value="d.periodDays" align="left" label-width="1.2rem" />
        <CommonLine label="到期日期：" :value="d.expireDate" align="left" label-width="1.2rem" />

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
import HomeStandardRoom from "../home/components/HomeStandardRoom.vue"
import CommonTabs from "../../components/CommonTabs.vue"
import CommonSearch from "../../components/CommonSearch.vue"
import CommonLine from "../../components/CommonLine.vue"
import Container from "../../components/Container.vue"
import { StandardRoomData } from "@/types/functionRoome2"
import { standardRoomDetailApi } from "@/api/functionRoom2.api"
import { useDateFormat } from "@vueuse/core"
import { usePageList } from "../../composables/usePageList"

const tabs = ref([
  { label: "全部", value: "all" },
  { label: "今日到期", value: "today" },
  { label: "出库", value: "out" },
  { label: "入库", value: "in" },
  { label: "超期", value: "due" }
])
// tab查询条件
function initQueryType(type: string) {
  const obj = {
    all: {},
    today: {
      overdue: 2
    },
    out: {
      inOut: 2
    },
    in: {
      inOut: 1
    },
    due: {
      overdue: 1
    }
  }
  return obj[type] || {}
}
const query = ref({
  orderBy: "operationDate",
  order: "desc"
})

const { loading, finished, dataList, onSearch, getList, initData } = usePageList<StandardRoomData>({
  api: standardRoomDetailApi,
  query,
  quickKey: "sampleQry",
  beforeTransofrmResponse(rows) {
    rows.forEach((d) => {
      d.operationDate = initDate(d.operationDate)
      if (d.formingDate && d.periodHours) {
        const t = d.periodHours * 3600000 // 将小时转换为毫秒
        d.expireDate = initDate(d.formingDate + t)
      }
      d.status = initStatus(d)
    })
    return rows
  }
})

function changeTab(item) {
  const q = initQueryType(item.value)
  if (q.overdue === 1) {
    query.value = {
      orderBy: "planTestTime",
      order: "desc",
      ...q
    }
  } else {
    query.value = {
      orderBy: "operationDate",
      order: "desc",
      ...q
    }
  }

  initData()
}

// 格式化日期
function initDate(t) {
  return t ? useDateFormat(t, "YYYY-MM-DD").value : ""
}

const now = initDate(Date.now())
const nowDate = new Date(now).getTime()
const statusObj = {
  1: "出库",
  2: "入库",
  3: "今日到期",
  4: "超期"
}
/**
 * 初始化状态信息
 */
function initStatus(item: StandardRoomData) {
  if (item.operationType === "2") {
    return "1"
  } else if (item.expireDate) {
    const e = new Date(item.expireDate).getTime()
    if (nowDate === e) return "3"
    if (nowDate > e) return "4"
  }
  if (item.operationType === "1") {
    return "2"
  }
  return ""
}
</script>

<style scoped lang="less">
@import "../commonRoomeDetail.less";
</style>
