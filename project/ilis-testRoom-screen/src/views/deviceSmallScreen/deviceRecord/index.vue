<template>
  <div ref="container" class="deviceRecord">
    <NavBar name="设备使用台账"></NavBar>
    <div class="content">
      <div class="device_name">{{ `${name}（${code}）` }}</div>
      <div class="search">
        <van-field v-model="formState.q" placeholder="请输入样品编号、检测参数" />
        <div class="date-picker-custom" @click="show = true">
          <span class="val">
            {{
              formState.dateRange?.length
                ? `${formatDate(formState.dateRange[0])} ~ ${formatDate(formState.dateRange[1])}`
                : "请选择使用时间"
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
          <div class="title">{{ item.equipmentCode }}</div>
          <div class="item-content">
            <div class="line">
              <div class="p people">
                <div class="label">使用人：</div>
                <div class="value">{{ item.userName }}</div>
              </div>
              <div class="p">
                <div class="label">使用时间：</div>
                <div class="value">
                  {{ item.startUseTime ? `${item.startUseTime}~${item.endUseTime}` : "--" }}
                </div>
              </div>
            </div>
            <div class="p">
              <div class="label">检测参数：</div>
              <div class="value">{{ item.testParamDisplayName }}</div>
            </div>
          </div>
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import NavBar from "../component/NavBar.vue"
import { useRoute } from "vue-router"
import { getDeviceRecord } from "@/api/deviceSmallScreen.api"
import { RecordEntity } from "./RecordEntity"
import { formatDate } from "@/utils/utils"

const { id, name, code } = useRoute().query as { id: string; name: string; code: string }

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

async function getList() {
  const query = {
    page: page.value,
    size: size.value,
    ...(id ? { equipmentId: id } : {}),
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
  page.value = 1
  dataSource.value = []
  getList()
}

getList()
</script>

<style lang="less" scoped>
.device_name {
  color: #0066ec;
  font-size: 36px;
  margin-bottom: 40px;
}
.deviceRecord {
  height: 100%;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 50px 10% 0;
    .search {
      margin-bottom: 20px;
      display: flex;
      > div {
        & + div {
          margin-left: 24px;
        }
      }
      .date-picker-custom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        color: #244f9b;
        border: 1px solid #001a75;
        background: #000b34;
        border-radius: 4px;
        padding: 0 30px;
        font-size: 28px;
        .icon {
          font-size: 28px;
          color: #368dff;
          display: flex;
          align-items: center;
          .close {
            margin-right: 10px;
          }
        }
      }
    }
  }
}

.item {
  padding: 32px 40px;
  color: #eef5ff;
  background: linear-gradient(97deg, #001a75 0%, rgba(0, 26, 117, 0) 100%);
  border-radius: 4px;
  margin-bottom: 20px;
  .line {
    display: flex;
    margin-bottom: 10px;
    .people {
      width: 500px;
    }
  }
  .p {
    display: flex;
    align-items: flex-start;
    .label {
      white-space: nowrap;
    }
    .value {
      word-break: break-all;
    }
  }
  .title {
    font-size: 36px;
    text-shadow: 0px 0px 6px #0066ec;
    margin-bottom: 20px;
  }
  .item-content {
    font-size: 24px;
    text-shadow: 0px 0px 6px #0066ec;
  }
}
.button {
  width: 180px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(114deg, #001a75 1%, rgba(0, 26, 117, 0) 100%);
  box-shadow: unset;
  font-size: 28px;
  color: #368dff;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  &:active {
    opacity: 0.8;
  }
}
:deep(.van-field) {
  background-color: #fff;
  border: 1px solid #001a75;
  background: #000b34;
  border-radius: 4px;
  .van-field__control {
    color: #244f9b;
  }
  input::placeholder {
    color: #244f9b;
  }
}
:deep(.van-cell) {
  &::after {
    border: unset;
  }
}
:deep(.van-field__body) {
  height: 100% !important;
  font-size: 28px;
}
</style>
