<script setup lang="ts">
import { toRefs, watch } from 'vue'
import EquipmentCollectionHistory from '../equipment-collection/components/EquipmentCollectionHistory.vue'
import { useDeviceDataCollectionStore } from '../../provider/useDeviceDataCollectionStore'
import MainEquipmentCollectionHistory from '../equipment-collection/components/MainEquipmentCollectionHistory.vue'
import TestTaskDetailPanel from '../testtask-detail/index.vue'
import { EquipmentType } from '../equipment-collection'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'

const udrStore = useUdrStore()

const { panelManager } = toRefs(udrStore)

const { inUseCollectionDevice } = toRefs(useDeviceDataCollectionStore())

// 右侧区域控制
watch(panelManager, (val) => {
  if (val.eqCollectionHistoryOpen)
    panelManager.value.testTaskDetail = false

  if (val.testTaskDetail)
    panelManager.value.eqCollectionHistoryOpen = false

  // panelManager.value.leftAreaOpen = false
}, {
  deep: true,
})
</script>

<template>
  <div class="udr-main-right">
    <!-- 主设备历史数据采集 -->
    <template v-if="inUseCollectionDevice?.type === EquipmentType.主设备">
      <MainEquipmentCollectionHistory v-if="panelManager.eqCollectionHistoryOpen" />
    </template>
    <!-- 量具设备历史数据采集 -->
    <template v-else>
      <EquipmentCollectionHistory v-if="panelManager.eqCollectionHistoryOpen" />
    </template>

    <!-- 试验详情 -->
    <TestTaskDetailPanel v-if="panelManager.testTaskDetail" />
  </div>
</template>

<style lang="less" scoped>
.udr-main-right {
  display: flex;
  background: #fff;
  border-left: solid 1px #E5E6EB;
}
</style>
