<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    :title="isDetail ? '培训计划详情' : (data.id ? '编辑培训计划' : '新增培训计划') "
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
    <div v-if="!isDetail" class=" px-3">
      <IlisForm
        ref="formRef"
        :entity="TrainPlanEntity"
        :cols="1"
        :init-data="data"
      ></ILisForm>
      <!-- 自定义属性部分 -->
      <IlisCustomPropertiesForm
        ref="customizeFormRef"
        customize-type="trainPlan"
        :default-value="data.customizeValues"
      >
      </IlisCustomPropertiesForm>
    </div>
    <DetailForProcess v-else :id="data.id?.toString()"></DetailForProcess>
  </a-modal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { addOrSaveTrainPlan } from './api'
import { TrainPlanEntity } from './TrainPlanEntity'
import DetailForProcess from './components/DetailForProcess.vue'
import { IlisCustomPropertiesForm, IlisForm } from '~/components/ilisComponent'

const props = withDefaults(defineProps<{
  show: boolean
  data: TrainPlanEntity
  isDetail?: boolean
  successCallback?: () => void
}>(), { show: false })

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

const internalOpen = ref(props.show)

const data = ref<TrainPlanEntity>(props.data)

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

async function handleOk() {
  const data = await formRef.value.getFormData()
  const customizeValueStr = await customizeFormRef.value.getFormData()
  data.customizeValueStr = JSON.stringify(customizeValueStr)
  loading.value = true
  await addOrSaveTrainPlan(TrainPlanEntity.fromJSON(data)).finally(() => {
    loading.value = false
  })
  message.success('操作成功')
  internalOpen.value = false
  if (props.successCallback) {
    props.successCallback()
  }
}
</script>
