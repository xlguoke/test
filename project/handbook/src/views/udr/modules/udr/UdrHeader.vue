<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { UdrLifecycle } from '../../provider/UdrLifecycle'
import { udrCore } from '@/views/udr/provider/UdrCore'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import SubmitReportSelect from '@/views/testTask/components/SubmitReport/SubmitReportSelect.vue'
import { useBeforeSubmitReportCheckHook } from '@/views/testTask/components/SubmitReport/useBeforeSubmitReportCheckHook'

const router = useRouter()

const submitReportSelectRef = ref()

const udrStore = useUdrStore()
const { leftWidth, sheetName, currentTestTask, panelManager, isOnlineUdrPage, isTemplateUdrPage } = toRefs(udrStore)

const leftMenuOpened = computed(() => leftWidth.value > 0)

function switchLeftMenu() {
  if (leftMenuOpened.value)
    panelManager.value.leftAreaOpen = false
  else
    panelManager.value.leftAreaOpen = true
}

function onSave() {
  if (isOnlineUdrPage.value) {
    udrCore.$this.setUdrVisibility(false)
    showLoadingToast({ duration: 0, forbidClick: true, message: '保存中...' })
  }
  udrCore.$this.saveData()
}

async function onSubmitReport() {
  const testTaskId = udrStore.getTestTaskId()
  const { beforeBubmitReport } = useBeforeSubmitReportCheckHook(testTaskId)

  udrCore.$this.setUdrVisibility(false)

  await beforeBubmitReport()

  submitReportSelectRef.value?.open(testTaskId)
}

// UDR保存时，增加加载遮罩，保存后关闭
UdrLifecycle.subscribe('OnSaveComplete', () => {
  closeToast()

  udrCore.$this.setUdrVisibility(true)
})
</script>

<template>
  <div class="udr-main-header">
    <div class="udr-main-header-left">
      <img src="@/assets/images/udr/header-back.svg" @click="router.go(-1)">
      <div class="udr-main-header-title" @click="switchLeftMenu">
        <div class="task-name">
          <p>{{ currentTestTask.testTaskName }}</p>
          <p>{{ sheetName }}</p>
        </div>
        <img src="@/assets/images/udr/header-down.svg" style="height: 1.4rem;">
      </div>
    </div>
    <div class="udr-main-header-action">
      <img v-if="isOnlineUdrPage" src="@/assets/images/udr/header-submit.svg" @click="onSubmitReport()">
      <img src="@/assets/images/udr/header-refresh.svg" @click="udrCore.$this.refreshUDR()">
      <img
        v-if="!isTemplateUdrPage"
        src="@/assets/images/udr/header-theme.svg" @click="() => {
          panelManager.actionBarOpen = !panelManager.actionBarOpen
        }"
      >
      <img v-if="!isTemplateUdrPage" src="@/assets/images/udr/header-save.svg" @click="onSave">
      <img src="@/assets/images/udr/header-setting.svg" @click="udrCore.$this.openUdrSettings()">
    </div>

    <!-- 提交报告 -->
    <SubmitReportSelect ref="submitReportSelectRef" />
  </div>
</template>

<style lang="less" scoped>
.udr-main-header {
  height: 68px;
  padding: 0 24px;
  background: #0066EC;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .udr-main-header-left {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .udr-main-header-title {
    cursor: pointer;
    display: flex;
    align-items: center;
    min-width: 10rem;
    gap: 8px;

    .task-name{
      flex: 1;
    }

    p {
      color: #fff;
      margin: 8px 0;
      font-size: 16px;
    }

    &:active {
      opacity: 0.6;
    }
  }

  .udr-main-header-action {
    display: flex;
    align-items: center;
    gap: 24px;

    img {
      cursor: pointer;
      width: 32px;

      &:active {
        opacity: 0.6;
      }
    }
  }
}
</style>
