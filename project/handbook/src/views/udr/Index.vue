<script setup lang="ts">
import { computed, onMounted, onUnmounted, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import type { UdrPageType } from '../testTask/udr'
import UdrHeader from './modules/udr/UdrHeader.vue'
import UdrLeft from './modules/udr/UdrLeft.vue'
import UdrRight from './modules/udr/UdrRight.vue'
import UdrAction from './modules/udr/UdrAction.vue'
import UdrBottom from './modules/udr/UdrBottom.vue'
import { UdrLifecycle } from './provider/UdrLifecycle'
import { EquipmentPanel } from './modules/equipment-collection'
import { useDeviceDataCollectionStore } from './provider/useDeviceDataCollectionStore'
import { udrCore } from '@/views/udr/provider/UdrCore'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import { useSheetEqParamStore } from '@/views/udr/provider/useSheetEqParamStore'
import { TestTaskService } from '@/providers/services/TestTaskService'

const route = useRoute()

const udrLifecycle = new UdrLifecycle()

const udrStore = useUdrStore()

const deviceDataCollectionStore = useDeviceDataCollectionStore()

const sheetEqParamStore = useSheetEqParamStore()

const { leftWidth, rightWidth, topHeight, bottomHeight, sheetName, udrStartParams, enableClearState, isTemplateUdrPage, isOnlineUdrPage } = toRefs(udrStore)

const { showEqPanel } = toRefs(deviceDataCollectionStore)

const showLeftView = computed(() => leftWidth.value > 0)

const showTopView = computed(() => topHeight.value > 0)

const showBottomView = computed(() => bottomHeight.value > 0)

const showRightView = computed(() => rightWidth.value > 0)

udrStore.init(route.params.type as UdrPageType)

deviceDataCollectionStore.init()

udrLifecycle.init()

/** 往udr开始脚本中设置试验日期等信息 */
async function setTestConclusionData() {
  if (!isOnlineUdrPage.value)
    return

  const testTaskService = new TestTaskService(udrStore.getTestTaskId())
  const data = await testTaskService.getTaskDetail()

  udrCore.$udr.invokeUdrScript(`$global.SetTestConclusionData(${JSON.stringify({
    testStartDate: data.testDate ? dayjs(data.testDate).format('YYYY-MM-DD') : undefined,
    testEndDate: data.testEndDate ? dayjs(data.testEndDate).format('YYYY-MM-DD') : undefined,
    testConditions: data.testConditions,
  })})`)
}

UdrLifecycle.subscribe('OnFileOpenAfter', () => {
  // 获取当前打开的表格并赋值
  sheetName.value = udrCore.$udr.getSheets().getActiveSheet().getName()

  setTestConclusionData()

  udrCore.$this.setUdrVisibility(true)
})

onMounted(() => {
  udrCore.$global.openUdr('udrTarget', JSON.stringify(udrStartParams.value))
})

// 卸载
onUnmounted(() => {
  udrCore.$global.closeUdr('udrTarget')

  if (enableClearState.value) {
    udrStore.$reset()
    deviceDataCollectionStore.$reset()
    sheetEqParamStore.$reset()
  }
})
</script>

<template>
  <div class="udr-main">
    <!-- udr顶部区域 -->
    <UdrHeader />

    <div class="udr-main-body">
      <!-- udr左侧区域 -->
      <UdrLeft v-show="showLeftView" :style="{ width: `${leftWidth}px` }" />

      <div class="udr-main-body-center">
        <!-- udr操作栏 -->
        <UdrAction v-if="!isTemplateUdrPage" v-show="showTopView" :style="{ height: `${topHeight}px` }" />

        <!-- 设备采集：设备操作区域 -->
        <EquipmentPanel v-show="showTopView && showEqPanel" />

        <!-- udr表格区域 -->
        <div class="udr-main-body-sheet">
          <div id="udrTarget"></div>
        </div>

        <!-- udr下方区域 -->
        <UdrBottom v-show="showBottomView" :style="{ height: `${bottomHeight}px` }" />
      </div>

      <!-- udr右侧区域 -->
      <UdrRight v-show="showRightView" :style="{ width: `${rightWidth}px` }" />
    </div>
  </div>
</template>

<style lang="less" scoped>
#udrTarget {
  width: 100%;
  height: 100%;
}

.udr-main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f8f9;

  .udr-main-body {
    flex: 1;
    overflow: hidden;
    display: flex;

    .udr-main-body-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .udr-main-body-sheet {
      flex: 1;
      overflow: hidden;
      padding: 24px;
    }
  }
}
</style>
