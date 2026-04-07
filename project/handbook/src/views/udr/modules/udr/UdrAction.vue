<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataAcquisition from '../data-acquisition/index.vue'
import { useDeviceDataCollectionStore } from '../../provider/useDeviceDataCollectionStore'
import ActionButton from './components/ActionButton.vue'
import ActionEqUseRegister from './components/ActionEqUseRegister.vue'
import { HandwriteMap, HandwriteType } from '.'
import { udrCore } from '@/views/udr/provider/UdrCore'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import { request } from '@/axios'

const router = useRouter()

const udrStore = useUdrStore()

const { getTestTaskId, isOnlineUdrPage } = udrStore

const { enableClearState, panelManager } = toRefs(udrStore)

const { showEqPanel } = toRefs(useDeviceDataCollectionStore())

// 笔迹
const handwriteVisible = ref(false)
const handwriteValue = ref(HandwriteType['文本+笔迹'])
const handwriteActions = [
  { text: '文本', key: HandwriteType.文本 },
  { text: '笔迹', key: HandwriteType.笔迹 },
  { text: '文本+笔迹', key: HandwriteType['文本+笔迹'] },
]

function selectHandwrite(e: any) {
  handwriteValue.value = e.key
  udrCore.$udr.setInkMode(Number.parseInt(handwriteValue.value))
}

// AI语音
const aiVoiceVisible = ref(false)

function switchAiVoice(visible: boolean) {
  if (visible) {
    // 打开AI语音时，关闭数据采集
    showEqPanel.value = false
    udrCore.$this.startAiInput()
  }
  else {
    udrCore.$this.stopAiInput()
  }

  aiVoiceVisible.value = visible
}

// 记录追溯
const checkRecordVisible = ref(false)

// 预览记录
function onPreviewRecord() {
  let recognizeCheckMode: number

  if (handwriteValue.value === HandwriteType['文本+笔迹'])
    recognizeCheckMode = 2
  else if (handwriteValue.value === HandwriteType.文本)
    recognizeCheckMode = -1
  else
    recognizeCheckMode = 0

  // 直接调用udr入口文件中已做好的功能
  udrCore.$udr.invokeUdrScript(`$global.OnClickCustomMenu(\'预览记录\', \'${recognizeCheckMode}\')`)
}

// 预览报告
function onPreviewReport() {
  // 直接调用udr入口文件中已做好的功能
  udrCore.$udr.invokeUdrScript('$global.OnClickCustomMenu(\'预览报告\')')
}

// 查看任务详情
async function onCheckTaskDetail() {
  panelManager.value.testTaskDetail = !panelManager.value.testTaskDetail

  // enableClearState.value = false

  // const taskId = getTestTaskId()

  // router.push({
  //   path: '/testTaskDetail',
  //   query: {
  //     id: taskId,
  //     isOffline: isOnlineUdrPage ? '0' : '1',
  //   },
  // })
}

// 数据采集
const enableDataAcquisition = ref(false)

const dataAcquisitionShow = ref(false)

// 检查是否显示数据采集
async function checkDataGather() {
  if (!isOnlineUdrPage)
    return

  const taskId = getTestTaskId()
  const res: any = await request(`/ilis2/dataGather/getTestType.do`, {
    params: {
      taskId,
    },
  })

  if (res.success && res.obj && res.obj.length)
    enableDataAcquisition.value = true
}

// 查看报告详情
function onCheckReportDetail() {
  enableClearState.value = false

  router.push({
    path: '/taskReportDetail',
    query: {
      testTaskId: getTestTaskId(),
    },
  })
}

checkDataGather()

// 隐藏/显示udr
watch(handwriteVisible, (newVal) => {
  udrCore.$this.setUdrVisibility(!newVal)
})
</script>

<template>
  <div class="udr-action">
    <div class="udr-action-main">
      <van-popover v-model:show="handwriteVisible" :actions="handwriteActions" @select="selectHandwrite">
        <template #reference>
          <div class="udr-action-dropdown-link">
            <img src="@/assets/images/udr/action-preview.svg">
            <span class="text">{{ HandwriteMap[handwriteValue] }}</span>
            <van-icon name="arrow-down" />
          </div>
        </template>
      </van-popover>

      <div class="udr-action-line" />

      <ActionButton @click="udrCore.$udr.getSheets().getActiveSheet().getUndoManager().undo()">
        <img src="@/assets/images/udr/action-redo.svg">
        撤销
      </ActionButton>

      <ActionButton @click="udrCore.$udr.getSheets().getActiveSheet().getUndoManager().redo()">
        <img src="@/assets/images/udr/action-recover.svg">
        恢复
      </ActionButton>

      <ActionButton @click="udrCore.$this.clearActiveSheet()">
        <img src="@/assets/images/udr/action-clear.svg">
        清空
      </ActionButton>

      <template v-if="isOnlineUdrPage">
        <div class="udr-action-line" />

        <ActionButton :active="aiVoiceVisible" @click="switchAiVoice(!aiVoiceVisible)">
          <img src="@/assets/images/udr/action-voice.svg">
          语音录入
        </ActionButton>

        <ActionButton
          :active="showEqPanel" @click="() => {
            showEqPanel = !showEqPanel

            if (showEqPanel) {
              switchAiVoice(false)
            }
          }"
        >
          <img src="@/assets/images/udr/action-eq.svg">
          设备采集
        </ActionButton>
      </template>

      <div class="udr-action-line" />

      <ActionButton
        :active="checkRecordVisible"
        @click="() => {
          udrCore.$this.setLogUIVisible(!checkRecordVisible)
          checkRecordVisible = !checkRecordVisible
        }"
      >
        <img src="@/assets/images/udr/action-record.svg">
        记录追溯
      </ActionButton>

      <!-- 设备使用登记 -->
      <ActionEqUseRegister v-if="isOnlineUdrPage" />

      <ActionButton v-if="isOnlineUdrPage" @click="onCheckReportDetail">
        <img src="@/assets/images/udr/action-detail.svg">
        报告详情
      </ActionButton>

      <ActionButton v-if="isOnlineUdrPage" @click="onPreviewRecord">
        <img src="@/assets/images/udr/action-preview.svg">
        预览记录
      </ActionButton>

      <ActionButton v-if="isOnlineUdrPage" @click="onPreviewReport">
        <img src="@/assets/images/udr/action-preview.svg">
        预览报告
      </ActionButton>

      <ActionButton v-if="enableDataAcquisition" @click="dataAcquisitionShow = true">
        <img src="@/assets/images/udr/action-test.svg">
        数据采集
      </ActionButton>

      <ActionButton :active="panelManager.testTaskDetail" @click="onCheckTaskDetail">
        <img src="@/assets/images/udr/action-detail.svg">
        试验详情
      </ActionButton>
    </div>

    <!-- 数据采集 -->
    <DataAcquisition v-model:show="dataAcquisitionShow" />
  </div>
</template>

<style lang="less" scoped>
.udr-action {
  box-shadow: inset 0px -1px 0px 0px #E5E6E8;
  background: #fff;
  overflow-x: auto;
  padding: 0 16px;
  display: flex;

  .udr-action-main {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 0 auto;
  }

  .udr-action-line {
    width: 1px;
    height: 24px;
    background: #6C6D6E;
  }
}

.udr-action-dropdown-link{
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-size: 14px;
  gap: 4px;
}
</style>
