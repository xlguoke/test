<template>
  <HtModal
    v-model:open="visible"
    :title="param.entity?.id ? '编辑' : '新增'"
    width="900px"
    :loading="spinning"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <BaseTitle>基本信息配置</BaseTitle>
    <IlisForm
      ref="ilisFormRef"
      :cols="1"
      :entity="IndustryListEntity"
      :init-data="initData"
    >
      <template #code="{ data }">
        <IlisInput
          v-model="data.code"
          style="width: 100%;"
          :entity="IndustryListEntity"
          field="code"
          :form-data="data"
          :disabled="!!param.entity?.id"
          @change="(v: string) => data.code = v"
        />
      </template>
      <template #program="{ data }">
        <IlisInput
          v-model="data.program"
          style="width: 100%;"
          :entity="IndustryListEntity"
          field="program"
          :form-data="data"
          :options="processorOptions"
          @change="(v: string) => {
            data.program = v
            handleChange(v)
          }"
        />
      </template>
    </IlisForm>

    <template v-if="selectedProcessor">
      <BaseTitle>动态配置</BaseTitle>
      <DynamicConfig
        ref="dynamicConfigRef"
        :key="selectedProcessor"
        class="mb-8"
        :config="processorConfig"
        :default-data="initData?.config?.config || {}"
      />
    </template>
  </HtModal>
</template>

<script lang="ts" setup>
import type { ProcessorConfig } from '../interface'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { BaseTitle } from '~/components/UI'
import { useIndustryStore } from '~/store/industryStore.ts'
import { processorApi, saveApi } from '../api.ts'
import { IndustryListEntity } from '../IndustryConfigEntity.ts'
import DynamicConfig from './DynamicConfig.vue'

const props = defineProps<IDialogPropsParam<null, {
  entity: IndustryListEntity
}>>()

const { clearIndustryCache } = useIndustryStore()

const spinning = ref(false)
const loading = ref(false)

const visible = ref(true)

const initData = ref<IndustryListEntity>()

const ilisFormRef = ref<IlisFormExpose<IndustryListEntity>>()

// 处理程序
const selectedProcessor = ref<string>('')
const processorOptions = ref<{ label: string, value: string, config: ProcessorConfig }[]>([])
const processorConfig = ref<ProcessorConfig>({})

// 动态配置
const dynamicConfigRef = ref()

// const processList = ref<{ label: string, value: string, disabled?: boolean }[]>([])
// async function init() {
//   const { data } = await processListApi()
//   processList.value = data.map(d => ({
//     label: d.module,
//     value: d.name,
//     disabled: d.required,
//   }))
//   initForm()
// }

/** 初始化 */
function initForm() {
  const _entity = props.param.entity
  if (!_entity) {
    initData.value = IndustryListEntity.fromJSON({
      enabled: true,
      // config: processList.value.map(d => d.value),
    })
  }
  // 流程必填信息变更，若之前未选中，编辑时默认选中
  else {
    // const requiredProcess = processList.value.filter(d => d.disabled)
    // const processes = _entity.processes || []
    // requiredProcess.forEach((d) => {
    //   if (!processes.includes(d.value))
    //     processes.push(d.value)
    // })
    initData.value = IndustryListEntity.fromJSON({
      program: _entity.config?.program || '',
      ..._entity,
    })
    handleChange(_entity.config?.program || '')
  }
}

/** 获取处理程序 */
async function getProcessor() {
  spinning.value = true
  const { data } = await processorApi().finally(() => {
    spinning.value = false
  })
  processorOptions.value = data.map(d => ({
    ...d,
    label: d.title,
    value: d.program,
  }))
}

/** 修改处理程序 */
async function handleChange(v: string) {
  if (processorOptions.value.length === 0) {
    await getProcessor()
  }
  const data = processorOptions.value.find(d => d.value === v)
  processorConfig.value = data?.config || {}
  selectedProcessor.value = v
}

onMounted(() => {
  initForm()
  getProcessor()
})

async function handleOk() {
  const formData = await ilisFormRef.value?.getFormData() as IndustryListEntity
  const config = await dynamicConfigRef.value?.saveData()
  if (!config)
    return

  loading.value = true
  formData.config = {
    program: selectedProcessor.value,
    config,
  }
  if (formData && props.param?.entity?.id) {
    formData.id = props.param.entity.id
  }

  await saveApi(formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  clearIndustryCache()
  props.onConfirm(null)
  visible.value = false
}
</script>

<style scoped>
:deep(.ant-checkbox-wrapper){
  width: 45%;
}
</style>
