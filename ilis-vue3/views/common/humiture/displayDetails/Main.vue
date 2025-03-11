<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: 0,
        padding: '16px',
      }"
    >
      <!--      <a-tabs v-model:activeKey="activeKey"> -->
      <!--        <a-tab-pane :key="1" tab="温湿度管理"></a-tab-pane> -->
      <!--        <a-tab-pane :key="2" tab="调养箱管理"></a-tab-pane> -->
      <!--      </a-tabs> -->

      <TempHum v-show="activeKey === 1" :data-source="dataSource" :status-data="statusData" />

      <!--      <MaintenanceBox v-show="activeKey === 2" /> -->
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import TempHum from './components/TempHum.vue'
// import MaintenanceBox from './components/MaintenanceBox.vue'
import type { ViewLaboratoryDataEntity } from '~/views/common/humiture/display'
import { getIotLabDetail } from '~/views/common/humiture/displayDetails/api.ts'

const activeKey = ref(1)

const pathParams = new URLSearchParams(location.search)

const displayId = pathParams.get('id')

const dataSource = ref<ViewLaboratoryDataEntity>()

const statusData = ref()

async function getDetail() {
  if (displayId) {
    const res = await getIotLabDetail(displayId)
    dataSource.value = res.data.info
    statusData.value = res.data.iotEqInfo
  }
}

getDetail()

provide('refreshDetail', getDetail)
</script>
