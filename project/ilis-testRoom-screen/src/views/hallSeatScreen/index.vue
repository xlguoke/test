<template>
  <div class="hall-seat-wrap">
    <Header></Header>
    <div
      class="hall-seat-body"
      :class="{
        close: detailModalVisible
      }"
    >
      <div class="hall-seat-left">
        <div class="screen-title">
          <p>欢迎光临瑞达试验大厅</p>
          <p class="sub-title">竭诚为您提供引导服务</p>
        </div>
        <ul class="tabs">
          <li :class="`tab-item ${activeKey === 1 ? 'active' : ''}`" @click="activeKey = 1">
            一楼导览图
          </li>
          <li :class="`tab-item ${activeKey === 2 ? 'active' : ''}`" @click="activeKey = 2">
            二楼导览图
          </li>
          <li class="tab-item" @click="showBusinessInfo">查看业务概览</li>
          <li class="tab-item" @click="showCompanyInfo">查看公司信息</li>
        </ul>
      </div>
      <ul class="tabs-con">
        <li v-show="activeKey === 1" class="tab-con-item">
          <!-- <img src="@/assets/images/hall-seat/one-floor.svg" alt="" /> -->
        </li>
        <li v-show="activeKey === 2" class="tab-con-item">
          <!-- <img src="@/assets/images/hall-seat/two-floor.svg" alt="" /> -->
        </li>
      </ul>
    </div>

    <FirstFloor
      v-if="configList.length > 0 && activeKey === 1"
      :class="{
        close: detailModalVisible
      }"
      :config-list="configList"
      @on-click="onCheckFunctionRoom"
    />

    <SecondFloor
      v-if="configList.length > 0 && activeKey === 2"
      :class="{
        close: detailModalVisible
      }"
      :config-list="configList"
      @on-click="onCheckFunctionRoom"
    />

    <FunctionRoomModal
      ref="functionRoomModal"
      :config-list="configList"
      @on-change-visible="onChangeVisible"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import Header from "./components/Header.vue"
import FunctionRoomModal from "./components/FunctionRoomModal.vue"
import FirstFloor from "./components/FirstFloor.vue"
import SecondFloor from "./components/SecondFloor.vue"
import { getSmartScreenConfig } from "@/api/testRoom.api"
import { configItem } from "@/utils/3DScene/floor"

onMounted(async () => {
  initfontSize()
})
window.onresize = () => {
  initfontSize()
}
const initfontSize = () => {
  const winW = document.body.clientWidth || window.innerWidth
  let size = (winW / 1920) * 100
  document.documentElement.style.fontSize = size + "px"
}

const activeKey = ref(1)
const functionRoomModal = ref()
const router = useRouter()
const detailModalVisible = ref(false)
const configList = ref<configItem[]>([])

const onCheckFunctionRoom = (name) => {
  functionRoomModal.value && functionRoomModal.value.open(name)
}

const onChangeVisible = (visible) => {
  detailModalVisible.value = visible
}

const getFunctionRooms = async () => {
  const res = await getSmartScreenConfig()
  configList.value.push(...res.data.rows)
}

function showCompanyInfo() {
  router.push({
    path: "/hallSeatScreen/companyInfo"
  })
}

const showBusinessInfo = () => {
  router.push({
    path: "/hallSeatScreen/businessInfo"
  })
}

getFunctionRooms()
sessionStorage.setItem("webUrl", location.href)
</script>

<style scoped lang="less">
/deep/.header-right {
  color: #fff;
}

.hall-seat-wrap {
  padding: 0 66px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  // background: #030a20;

  .hall-seat-body {
    flex: 1;
    display: flex;
    height: 0;
    transition: all 0.5s;

    &.close {
      transform: translateX(-420px);
      opacity: 0;
    }

    .hall-seat-left {
      margin-top: 4%;
      position: relative;
      z-index: 20;
    }

    .screen-title {
      margin-top: 30px;
      font-size: 36px;
      color: #fff;
      font-weight: 600;
      letter-spacing: 4px;

      .sub-title {
        margin-top: 20px;
        font-size: 24px;
      }
    }
    .tabs {
      margin-top: 50px;
      width: 300px;
      text-align: center;
      .tab-item {
        padding: 0 50px;
        margin-bottom: 40px;
        line-height: 70px;
        font-size: 24px;
        font-weight: 600;
        color: #0049aa;
        cursor: pointer;
        background: url("@/assets/images/hall-seat/btn-bg.png") no-repeat 100% 100%;
        background-size: 100% 100%;
        border: solid 1px;
        background-color: rgba(18, 140, 255, 0.08);

        &:hover,
        &.active {
          color: #fff;
          background: url("@/assets/images/hall-seat/btn-bg-active.png") no-repeat 100% 100%;
          background-size: 100% 100%;
          border-color: transparent;
        }
      }
      .company-info {
        float: right;
        padding: 0 30px;
        line-height: 52px;
        font-size: 18px;
        font-weight: 500;
        color: #fff;
        background-color: #002c6a;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
          opacity: 0.9;
        }
      }
    }
  }
  .tabs-con {
    display: flex;
    align-items: center;
    flex: 1;
    margin-left: 50px;
    width: 0;
    .tab-con-item {
      padding: 26px 0;
      width: 100%;
      box-sizing: border-box;
      img {
        display: block;
        margin: 0 auto;
        width: 100%;
      }
    }
  }
}
</style>
