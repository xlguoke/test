<!-- eslint-disable prettier/prettier -->
<template>
  <div class="task-list">
    <div class="absolute top-[1.2rem] right-5">
      <van-icon name="filter-o" size="0.5rem" @click="sortShow = true" />
    </div>
    <div class="sel">
      <CommonButton
        class="btn"
        :type="formState.status === LaboratoryTaskStatus.ALL ? 'primary' : undefined"
        @click="formState.status = LaboratoryTaskStatus.ALL;handleSearch()"
      >
        全部
      </CommonButton>
      <CommonButton
        class="btn"
        :type="formState.status === LaboratoryTaskStatus.WAITING ? 'primary' : undefined"
        @click="formState.status = LaboratoryTaskStatus.WAITING;handleSearch()"
      >
        待检测
      </CommonButton>
      <CommonButton
        class="btn"
        :type="formState.status === LaboratoryTaskStatus.TESTING ? 'primary' : undefined"
        @click="formState.status = LaboratoryTaskStatus.TESTING;handleSearch()"
      >
        检测中
      </CommonButton>
      <CommonButton
        class="btn"
        :type="formState.status === LaboratoryTaskStatus.FINISHED ? 'primary' : undefined"
        @click="formState.status = LaboratoryTaskStatus.FINISHED;handleSearch()"
      >
        已完成
      </CommonButton>
    </div>
    <div class="search">
      <van-field v-model="formState.q" placeholder="请输入样品名称、任务编号、检测人员" />
      <div>
        <div class="button" @click="handleSearch">搜索</div>
      </div>
    </div>
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="getList"
    >
      <Container v-for="item in dataSource" :key="item.id" class="item">
        <TaskCard 
        :lab-id="labId"
        :data="item" 
        is-show-un-finish 
        @change="handleSearch"></TaskCard>
      </Container>
    </van-list>
    <van-back-top />

    <van-popup v-model:show="sortShow" destroy-on-close position="bottom">
      <van-picker
        :model-value="[sort.order]"
        title="选择排序"
        show-toolbar
        :columns="sortColumns"
        @confirm="handleSortConfirm"
        @cancel="handleSortCancel"
      />
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
import { computed, provide, ref, toRefs } from "vue"
import Container from "../../components/Container.vue"
import TaskCard from "./components/TaskCard.vue"
import CommonButton from "../../components/CommonButton.vue"
import { getLabTaskPage } from "@/api/functionRoom2.api"
import { LaboratoryTaskStatus } from "."
import { useStore } from "@/store"
import { parseAddressToObj } from "@/utils/utils"
import { TemHumData } from "@/utils/iotDataRequest"

const loading = ref(false)

const { screenConfig } = toRefs(useStore())

const labId = computed(() => {
  if (!screenConfig.value.url) return ""
  const query = parseAddressToObj(screenConfig.value.url)
  return query.labId || ""
})

const formState = ref<{
  q: string
  status: LaboratoryTaskStatus
}>({
  q: "",
  status: LaboratoryTaskStatus.WAITING
})

const dataSource = ref([] as any[])

const total = ref(0)

const page = ref(1)

const size = ref(10)

const finished = ref(false)
const sortShow = ref(false)

// 功能室数据
const labData = ref()

// 功能室温湿度数据
const iotTemHumData = ref<TemHumData["data"]>()

// 注入功能室数据
provide("labData", labData)

// 注入温湿度数据，需要的子组件不用再单独去获取
provide("iotTemHumData", iotTemHumData)

const sort = ref({
  order: "",
  orderBy: ""
})
const sortColumns = [
  { text: "默认排序", value: "" },
  { text: "要求报告时间由远及近", value: "ASC" },
  { text: "要求报告时间由近及远", value: "DESC" }
]

async function getList() {
  const query = {
    page: page.value,
    size: size.value,
    labId: labId.value,
    taskStatus: formState.value.status,
    ...sort.value,
    ...(formState.value.q ? { quickQry: formState.value.q } : {})
  }
  loading.value = true
  const { data, code } = await getLabTaskPage(query)
  if (code === 20000) {
    dataSource.value = [...dataSource.value, ...data.rows]
    total.value = data.count
    page.value += 1
    if (data.count <= dataSource.value.length) finished.value = true
  }
  loading.value = false
}

function handleSortConfirm({ selectedValues }) {
  sort.value.order = selectedValues[0]
  sort.value.orderBy = sort.value.order ? "internalReportDate" : ""
  sortShow.value = false
  handleSearch()
}
function handleSortCancel() {
  sortShow.value = false
}

function handleSearch() {
  finished.value = false
  page.value = 1
  total.value = 0
  dataSource.value = []
  getList()
}

getList()
</script>
<style lang="less" scoped>
:deep(.van-field) {
  border: 1px solid #ffffff;
  border-radius: 0.12rem;
  background: rgba(255, 255, 255, 0.3);
  .van-field__control {
    color: #224059;
  }
  input::placeholder {
    color: #59768f;
  }
}
:deep(.van-cell) {
  &::after {
    border: unset;
  }
}
:deep(.van-field__body) {
  height: 100% !important;
}
.task-list {
  padding-bottom: 1.6rem;
  .sel {
    margin-bottom: 32px;
    .btn + .btn {
      margin-left: 24px;
    }
  }
  .search {
    margin-bottom: 0.32rem;
    display: flex;
    > div {
      & + div {
        margin-left: 0.24rem;
      }
    }
    .button {
      white-space: nowrap;
      height: 100%;
      border-radius: 0.12rem;
      padding: 0.22rem 0.38rem;
      background: #0066ec;
      box-sizing: border-box;
      border: 1px solid #ffffff;
      cursor: pointer;
      color: #fff;
      font-size: 28px;
      &:active {
        opacity: 0.8;
      }
    }
    .date-picker-custom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      color: #59768f;
      border: 1px solid #ffffff;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 0.12rem;
      padding: 0.2rem 0.24rem;
      font-size: 0.28rem;
      .icon {
        font-size: 0.28rem;
        color: #224059;
        display: flex;
        align-items: center;
        .close {
          margin-right: 0.1rem;
        }
      }
    }
  }
}
</style>
