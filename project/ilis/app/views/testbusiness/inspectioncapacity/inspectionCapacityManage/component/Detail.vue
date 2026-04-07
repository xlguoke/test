<template>
  <HtModal
    v-model:open="visible"
    title="预警详情"
    cancel-text="关闭"
    hide-confirm
    width="720px"
    :after-close="onClosed"
  >
    <BaseTitle class=" mt-2">
      预警信息
    </BaseTitle>
    <BaseWarningInfo :init-data="baseWarningInfoData" />

    <div class="mt-1">
      <a-tabs v-model:active-key="activeKey">
        <a-tab-pane key="1" tab="预警详情">
          <WarningDetail :type="warningType" :init-data="warningDetailData" />
        </a-tab-pane>
        <a-tab-pane key="2" tab="处理详情">
          <Dispose :init-data="disposeDetailData" :show-file-del="false" :is-detail="true" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { CapacityEntity, IBaseWarningInfo, IDisposeData, IWawningDetail } from '../CapacityEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { getWarningDetail } from '../api'
import BaseWarningInfo from './BaseWarningInfo.vue'
import Dispose from './Dispose.vue'
import WarningDetail from './WarningDetail.vue'

const props = defineProps<IDialogPropsParam<null, CapacityEntity>>()

const visible = ref(true)
const activeKey = ref('1')
const initData = ref(props.param) // 表格单行完整数据

const baseWarningInfoData = ref<IBaseWarningInfo>({})
const warningDetailData = ref<IWawningDetail[]>([])
const disposeDetailData = ref<IDisposeData>({})
const warningType = ref(initData.value.warningType)
async function initDetailData() {
  try {
    const { data } = await getWarningDetail(initData.value?.id)
    const { reportSn, warningType, objectName, objectRemark, capacityLimit, warningDate, createDate, details, disposeInfo } = data
    baseWarningInfoData.value = {
      reportSn,
      warningType,
      objectName,
      objectRemark,
      capacityLimit,
      warningDate,
      createDate,
    }
    warningDetailData.value = details
    disposeDetailData.value = disposeInfo
  }
  catch (error) {
    console.error(error)
  }
}

initDetailData()
</script>
