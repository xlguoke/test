<template>
  <div class="task-list">
    <div class="absolute top-[1.2rem] right-5 flex items-center">
      <CommonButton class="mr-2" @click="batchFlag = !batchFlag">批量操作</CommonButton>
      <van-icon name="filter-o" size="0.5rem" @click="sortShow = true" />
    </div>
    <div class="search">
      <van-field
        v-model="formState.q"
        style="flex: 5"
        placeholder="请输入任务编号/样品名称/样品编号"
      />
      <van-field
        v-model="formState.samplingStatus"
        style="flex: 3"
        readonly
        placeholder="请选择送样状态"
        @click="show = true"
      >
        <template #right-icon>
          <van-icon v-if="!formState.samplingStatus" name="arrow-down" size="0.32rem" />
          <van-icon
            v-else
            name="close"
            size="0.32rem"
            @click.stop="formState.samplingStatus = undefined"
          />
        </template>
      </van-field>

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
      <template v-if="!batchFlag">
        <Container v-for="item in dataSource" :key="item.id" class="item">
          <SampleSendCard :lab-id="labId" :data="item" is-show-un-finish @change="handleSearch" />
        </Container>
      </template>
      <template v-else>
        <van-checkbox-group
          v-model="selectedIds"
          class="checkbox-group"
          @change="handleCheckedChange"
        >
          <Container v-for="item in dataSource" :key="item.id" class="item">
            <van-checkbox shape="square" :name="item.id" class="w-full">
              <SampleSendCard
                :lab-id="labId"
                :data="item"
                is-show-un-finish
                @change="handleSearch"
              />
            </van-checkbox>
          </Container>
        </van-checkbox-group>
      </template>
    </van-list>
    <div
      v-if="batchFlag"
      class="fixed bottom-[0] left-[0] right-[0] flex items-center justify-between bg-white p-4 pb-8"
    >
      <van-checkbox
        v-model="isCheckAll"
        class="check_all"
        :indeterminate="isIndeterminate"
        @change="checkAllChange"
      >
        <span>全选</span>
        <span class="text-2 text-[#999] ml-2">(已选择 {{ selectedIds.length }})</span>
      </van-checkbox>
      <div class="flex items-center">
        <CommonButton type="primary" class="ml-2" @click="handleCancel(selectedIds)">
          取消送样
        </CommonButton>
        <CommonButton type="primary" class="ml-2" @click="handleConfirm(selectedIds)">
          送达确认
        </CommonButton>
      </div>
    </div>
    <van-back-top />
    <van-popup v-model:show="show" destroy-on-close position="bottom">
      <van-picker
        title="选择送样状态"
        show-toolbar
        :columns="
          ['已取消', '待审核', '已审核', '运送中', '已送达', '已登记', '已核实', '已结案'].map(
            (item) => ({
              text: item,
              value: item
            })
          )
        "
        @confirm="handleStatusConfirm"
        @cancel="handleStatusCancel"
      />
    </van-popup>

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
    <!-- 扫码登录 -->
    <ScanLogin ref="scanLoginRef" />
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, toRefs } from "vue"
import Container from "../../components/Container.vue"
import { getSampleSendTaskPage } from "@/api/functionRoom2.api"
import { useStore } from "@/store"
import { parseAddressToObj } from "@/utils/utils"
import SampleSendCard from "./SampleSendCard.vue"
import { useSampleSentStatus } from "@/utils/useSampleSentStatus"
import CommonButton from "../../components/CommonButton.vue"
import ScanLogin from "../../components/ScanLogin.vue"
import { useSampleSendComposable } from "."
import { functionRoom2Store } from "@/store/functionRoom2"

const loading = ref(false)

const { screenConfig } = toRefs(useStore())
const { handleCancelSampleSend, handleConfirmSampleSend } = useSampleSendComposable()
const { authConfig } = toRefs(functionRoom2Store())

const labId = computed(() => {
  if (!screenConfig.value.url) return ""
  const query = parseAddressToObj(screenConfig.value.url)
  return query.labId || ""
})

const formState = ref<{
  q: string
  samplingStatus: string | undefined
}>({
  q: "",
  samplingStatus: undefined
})

const sort = ref({
  sort: "",
  order: ""
})
const sortColumns = [
  { text: "默认排序", value: "" },
  { text: "要求送达时间由远及近", value: "ASC" },
  { text: "要求送达时间由近及远", value: "DESC" }
]

const dataSource = ref([] as any[])

const total = ref(0)

const page = ref(1)

const size = ref(10)

const finished = ref(false)

const show = ref(false)
const sortShow = ref(false)

const batchFlag = ref(false)

const selectedIds = ref([] as string[])

const isCheckAll = ref(false)
const isIndeterminate = ref(false)
const scanLoginRef = ref()

function checkAllChange(val: boolean) {
  selectedIds.value = val ? dataSource.value.map((item) => item.id) : []
  isIndeterminate.value = false
}

function handleCheckedChange(val: string[]) {
  isCheckAll.value = val.length === dataSource.value.length
  isIndeterminate.value = val.length > 0 && val.length < dataSource.value.length
}

async function handleConfirm(ids: string[]) {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optIntelligentSampleTask
    },
    async (userInfo) => {
      const res = await handleConfirmSampleSend(ids, {
        operatorId: userInfo?.id
      })
      window.open(res)
      getList()
    }
  )
}

async function handleCancel(ids: string[]) {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optIntelligentSampleTask
    },
    async (userInfo) => {
      await handleCancelSampleSend(ids, {
        operatorId: userInfo?.id
      })
      getList()
    }
  )
}

let ins: EventSource | undefined
async function getList() {
  const query = {
    page: page.value,
    size: size.value,
    labId: labId.value,
    ...sort.value,
    ...(formState.value.q ? { q: formState.value.q } : {}),
    ...(formState.value.samplingStatus ? { samplingStatus: formState.value.samplingStatus } : {})
  }
  loading.value = true
  const data = await getSampleSendTaskPage(query)
  dataSource.value = [...dataSource.value, ...data.rows]
  if (ins) {
    ins.close()
  }
  ins = useSampleSentStatus(dataSource)

  total.value = data.count
  page.value += 1
  console.log(data.total, dataSource.value.length)

  if (data.total <= dataSource.value.length) {
    finished.value = true
  }

  loading.value = false
}

function handleStatusConfirm({ selectedValues }) {
  formState.value.samplingStatus = selectedValues[0]
  show.value = false
}

function handleStatusCancel() {
  formState.value.samplingStatus = undefined
  show.value = false
}

function handleSortConfirm({ selectedValues }) {
  sort.value.order = selectedValues[0]
  sort.value.sort = sort.value.order ? "requestDeliveryTime" : ""
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
:deep(.van-checkbox__label) {
  flex: 1;
}
:deep(.van-checkbox__icon) {
  width: 36px;
  height: 36px;
  font-size: 36px;
  .van-icon {
    border-radius: 4px;
    width: 100%;
    height: 100%;
    border: 1px solid #ffffff;
  }
}
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
