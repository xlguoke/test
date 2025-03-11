<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    :title="isDetail ? '培训记录详情' : (data.id ? '编辑培训记录' : '新增培训记录') "
    destroy-on-close
    width="540px"
    :keyboard="false"
    :mask-closable="false"
    :body-style="{ height: '70vh', overflowY: 'auto' }"
  >
    <template #footer>
      <a-button @click="internalOpen = false">
        {{ isDetail ? '关闭' : '取消' }}
      </a-button>
      <a-button
        v-if="!isDetail"
        type="primary"
        :loading="loading"
        @click="handleOk"
      >
        确定
      </a-button>
    </template>
    <div class="px-3">
      <IlisForm
        ref="formRef"
        :entity="TrainRecordEntity"
        :cols="1"
        :init-data="data"
        :disabled="isDetail"
      >
        <template #isTrainPlan="{ data: formData }">
          <IlisInput
            v-model="formData.isTrainPlan"
            :entity="TrainRecordEntity"
            :options="TrainRecordEntity.getOptions('isTrainPlan')"
            field="isTrainPlan"
          ></IlisInput>
          <a-button
            v-if="formData.isTrainPlan === HasTrainPlan.YES"
            type="primary"
            @click="showTrainPlanSelector = true;"
          >
            选择
          </a-button>
        </template>
      </ILisForm>
      <!-- 自定义属性部分 -->
      <IlisCustomPropertiesForm
        ref="customizeFormRef"
        customize-type="trainRecord"
        :default-value="data.customizeValues"
        :disabled="isDetail"
      >
      </IlisCustomPropertiesForm>
    </div>
    <!-- 培训计划选择器 -->
    <TrainPlanSelector
      v-model:show="showTrainPlanSelector"
      @cancel="showTrainPlanSelector = false"
      @confirm="handleConfirmTrainPlan($event)"
    ></TrainPlanSelector>
  </a-modal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { TrainPlanEntity } from '../plan/TrainPlanEntity'
import { addOrSaveTrainRecord } from './api'
import { HasTrainPlan, TrainRecordEntity } from './TrainRecordEntity'
import { IlisForm, IlisInput } from '~/components/ilisComponent'
import TrainPlanSelector from '~/components/TrainPlanSelector.vue'

const props = withDefaults(defineProps<{
  show: boolean
  data: TrainRecordEntity
  isDetail?: boolean
  successCallback?: () => void
}>(), { show: false })

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

const internalOpen = ref(props.show)

const data = ref<TrainRecordEntity>(props.data)

const showTrainPlanSelector = ref(false)

const customizeFormRef = ref()

watch(() => props.show, (val) => {
  internalOpen.value = val
  if (props.show) {
    data.value = props.data
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
  if (!val) {
    emits('close')
  }
})

const loading = ref(false)

const formRef = ref()

function handleConfirmTrainPlan(datas: TrainPlanEntity[]) {
  const json = { ...datas[0] } as any
  delete json.id
  json.isTrainPlan = HasTrainPlan.YES
  json.id = data.value.id
  data.value = TrainRecordEntity.fromJSON(json)
  showTrainPlanSelector.value = false
}

async function handleOk() {
  const data = await formRef.value.getFormData()
  const customizeValueStr = await customizeFormRef.value.getFormData()
  data.customizeValueStr = JSON.stringify(customizeValueStr)
  loading.value = true
  await addOrSaveTrainRecord(TrainRecordEntity.fromJSON(data)).finally(() => {
    loading.value = false
  })
  loading.value = false
  message.success('操作成功')
  internalOpen.value = false
  if (props.successCallback) {
    props.successCallback()
  }
}
</script>
