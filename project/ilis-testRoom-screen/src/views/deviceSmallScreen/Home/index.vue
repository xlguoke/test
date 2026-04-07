<template>
  <div class="sceen-container">
    <div v-if="back" class="nav">
      <NavBar name="设备主页"></NavBar>
    </div>
    <div class="home-main">
      <div v-if="listData.length > 1" class="left">
        <List
          v-model:current-device="currentDevice"
          :data="listData"
          name-key="name"
          value-key="equipmentSn"
        />
      </div>
      <div class="right">
        <div v-if="showMessage" :key="currentDevice.id" class="message">
          {{ currentDevice.statusDesc }}
        </div>
        <div class="detail">
          <Detail :data="currentDevice" />
        </div>
        <div class="menu">
          <router-link :to="`/deviceSmallScreen/detail?id=${currentDevice.id}`">
            <img src="@/assets/images/deviceSmallScreen/deviceDetail.svg" alt="设备详情" />
          </router-link>
          <router-link :to="`/deviceSmallScreen/workingManual?id=${currentDevice.id}`">
            <img src="@/assets/images/deviceSmallScreen/deviceHelp.svg" alt="操作指南" />
          </router-link>
          <router-link :to="`/deviceSmallScreen/checkDetail?id=${currentDevice.id}`">
            <img src="@/assets/images/deviceSmallScreen/checkDetail.svg" alt="校验详情" />
          </router-link>
          <router-link
            :to="`/deviceSmallScreen/deviceRecord?id=${currentDevice.id}&name=${currentDevice.name}&code=${currentDevice.equipmentSn}`"
          >
            <img src="@/assets/images/deviceSmallScreen/deviceRecord.svg" alt="设备使用台账" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from "vue"
import Detail from "./component/Detail.vue"
import List from "./component/List.vue"
import { getDeviceList } from "@/api/deviceSmallScreen.api"
import { DeviceEntity } from "./DeviceEntity"
import { useRoute } from "vue-router"
import { message } from "ant-design-vue"
import { useScreenHooks } from "@/hooks/useScreenHooks"
import NavBar from "../component/NavBar.vue"
import { parseAddressToObj } from "@/utils/utils"
import { useStore } from "@/store"

const { back, ids: backIds } = useRoute().query as { ids: string; back?: string }

const { refreshData } = useScreenHooks()

const { screenConfig } = toRefs(useStore())

const listData = ref([])

const currentDevice = ref<DeviceEntity>({} as DeviceEntity)

const ids = computed(() => {
  if (back) {
    if (backIds) return backIds
    return ""
  }
  if (!screenConfig.value.url) return ""
  const query = parseAddressToObj(screenConfig.value.url)
  console.log("query", query)

  return query.ids || ""
})

const showMessage = computed(() => {
  return !!currentDevice.value.statusDesc
})

async function getList() {
  if (!ids.value) return message.error("请配置正确的设备id。例：?ids=1,2,3")
  const { data, code } = await getDeviceList(ids.value)
  if (code === 20000) {
    listData.value = data
    if (!currentDevice.value) {
      currentDevice.value = data[0]
    } else {
      currentDevice.value = data.find((item) => item.id === currentDevice.value.id) || data[0]
    }
  }
}

getList()
if (!back) {
  refreshData(getList)
}
</script>

<style lang="less" scoped>
.sceen-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.nav {
  padding: 20px 40px 0 40px;
}
.home-main {
  flex: 1;
  color: #fff;
  display: flex;
  justify-content: center;
  padding: 30px 50px 0 0;
  overflow: hidden;
  .left {
    width: 350px;
    height: 100%;
    overflow-y: auto;
    padding-left: 40px;
  }
  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-width: 1438px;
    margin-left: 40px;
    .menu {
      margin-top: 30px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      > div {
        flex: 1;
      }
      img {
        width: 330px;
        height: 286px;
      }
    }
  }
}
.ant-alert-info {
  background-color: transparent;
  color: #fff;
  font-size: 28px;
  border: 2px solid #193b7e;
  // padding: 20px 30px;
}
:deep(.ant-alert-close-icon) {
  font-size: 28px;
  .anticon-close {
    color: #368dff;
  }
}
.message {
  margin-bottom: 20px;
  font-size: 28px;
  border: 2px solid #193b7e;
  border-radius: 16px;
  padding: 20px 30px;
}
</style>
