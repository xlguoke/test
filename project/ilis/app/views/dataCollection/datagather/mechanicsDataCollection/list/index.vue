<template>
  <a-tabs :default-active-key="tabsActive" class="h-full">
    <a-tab-pane :key="0" tab="主设备">
      <PrimaryDeivce />
    </a-tab-pane>
    <a-tab-pane :key="1" tab="量具类设备">
      <MeasureDevice />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
import MeasureDevice from './components/MeasureDevice.vue'
import PrimaryDeivce from './components/PrimaryDeivce.vue'

const tabsActive = ref(0)
</script>

<style scoped>
:deep(.ant-tabs-content),
:deep(.ant-tabs-tabpane){
  height: 100%;
}
</style>
