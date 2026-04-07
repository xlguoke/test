<template>
  <div class="device-record">
    <div class="search">
      <!-- <van-field v-model="formState.q" placeholder="请输入样品编号、检测参数" /> -->
      <div class="date-picker-custom" @click="show = true">
        <span class="val">
          {{
            formState.dateRange?.length
              ? `${formatDate(formState.dateRange[0])} ~ ${formatDate(formState.dateRange[1])}`
              : "选择使用时间"
          }}
        </span>
        <div class="icon">
          <van-icon
            v-show="formState.dateRange?.length"
            name="close"
            class="close"
            @click.stop="formState.dateRange = undefined"
          />
          <van-icon name="notes-o" />
        </div>
      </div>
      <van-calendar
        v-model:show="show"
        type="range"
        switch-mode="year-month"
        @confirm="
          (values) => {
            formState.dateRange = values
            show = false
          }
        "
      />
      <!-- <a-button type="primary" html-type="submit" @click="handleSearch">搜索</a-button> -->
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
      <!-- <van-cell v-for="item in dataSource" :key="item.id" :title="item.equipmentCode" /> -->
      <div v-for="item in dataSource" :key="item.id" class="item">
        <!-- <CommonLine class="line" label="使用人：" :value="item.userName"></CommonLine> -->
        <CommonLine
          class="line"
          label="使用时间："
          :value="item.startUseTime ? `${item.startUseTime}~${item.endUseTime || '--'}` : '--'"
        ></CommonLine>
        <CommonLine label="检测参数：" :value="item.testParamDisplayName"></CommonLine>
      </div>
    </van-list>
    <van-back-top />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { getDeviceRecord } from "@/api/deviceSmallScreen.api"
import { formatDate } from "@/utils/utils"
import { RecordEntity } from "@/views/deviceSmallScreen/deviceRecord/RecordEntity"
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import { watch } from "vue"

const props = defineProps<{
  id: string
}>()

const show = ref(false)

const loading = ref(false)

const formState = ref<{
  q: string
  dateRange: [string, string] | undefined
}>({
  q: "",
  dateRange: undefined
})

const dataSource = ref([] as RecordEntity[])

const total = ref(0)

const page = ref(1)

const size = ref(10)

const finished = ref(false)

watch(
  () => props.id,
  () => {
    handleSearch()
  }
)

async function getList() {
  if (!props.id) return
  const query = {
    page: page.value,
    size: size.value,
    onlyUseTime: 1,
    ...(props.id ? { equipmentId: props.id } : {}),
    ...(formState.value.q ? { q: formState.value.q } : {}),
    ...(formState.value.dateRange?.length
      ? { stamp: formState.value.dateRange.map((i) => new Date(i).getTime()).join(",") }
      : {})
  }
  loading.value = true
  const { data, code } = await getDeviceRecord(query)
  if (code === 20000) {
    dataSource.value = [...dataSource.value, ...data.rows]
    total.value = data.count
    page.value += 1
    if (data.count <= dataSource.value.length) finished.value = true
  }
  loading.value = false
}

function handleSearch() {
  finished.value = false
  page.value = 1
  dataSource.value = []
  getList()
}

getList()
</script>

<style lang="less" scoped>
:deep(.van-field) {
  border: 1px solid #ffffff;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0.12rem;
  .van-field__control {
    color: #59768f;
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
.device-record {
  // height: 100%;
  // overflow-y: auto;
  .item {
    border-bottom: 1px solid #fff;
    padding: 24px 0;
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
      height: 0.8rem;
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
  .line {
    margin-bottom: 0.24rem;
  }
}
</style>
