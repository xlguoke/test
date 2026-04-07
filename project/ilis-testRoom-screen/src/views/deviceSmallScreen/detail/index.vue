<template>
  <div class="deviceDetail">
    <NavBar name="设备详情"></NavBar>
    <div class="content">
      <Info :data="deviceDetail"></Info>
      <CheckParams :data="deviceParamList"></CheckParams>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from "vue-router"
import NavBar from "../component/NavBar.vue"
import CheckParams from "./component/CheckParams.vue"
import Info from "./component/Info.vue"
import { getDeviceInfo, getDeviceParam } from "@/api/deviceSmallScreen.api"
import { ref } from "vue"
import { DeviceDetailEntity, DeviceParamEntity } from "./DeviceDetailEntity"

const { id } = useRoute().query as { id: string }

const deviceDetail = ref({} as DeviceDetailEntity)

const deviceParamList = ref([] as DeviceParamEntity[])

/**
 * 获取设备详情
 */
async function getDetail() {
  const { data, code } = await getDeviceInfo(id)
  if (code === 20000) {
    deviceDetail.value = data as DeviceDetailEntity
  }
}
async function getParam() {
  const { data, code } = await getDeviceParam(id)
  if (code === 20000) {
    deviceParamList.value = data as DeviceParamEntity[]
  }
}

getDetail()
getParam()
</script>
<style lang="less" scoped>
.deviceDetail {
  height: 100%;
  overflow-y: auto;
  padding: 20px 40px;

  .content {
    padding-left: 10%;
    padding-right: 5%;
  }
}
</style>
