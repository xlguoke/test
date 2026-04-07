<template>
  <ht-modal
    v-model:open="visible"
    :title="param.title"
    full-screen
    :after-close="onClosed"
    :hide-confirm="param.pageState.isDetailPage"
    :confirm-loading="loading"
    @ok="handleOk()"
  >
    <template #after-title>
      <a-tag v-if="param.industryName" color="blue" class="!ml-3 !text-[12px]">
        领域：{{ param.industryName }}
      </a-tag>
    </template>
    <SelectSample ref="selectSampleRef" :consgin-page-param="props.param" />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { MetaDataEntity } from './modules/services/MetaDataBuilder'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { EGenerateCode } from '~/api/consign/consign-management'
import type { IConsginPageParam } from '~/views/consign/consignDetail/interface'
import { message } from 'ant-design-vue'
import SelectSample from './SelectSample.vue'

const props = defineProps<IDialogPropsParam<MetaDataEntity[], IConsginPageParam>>()

const visible = ref(true)

const loading = ref(false)

const selectSampleRef = ref<InstanceType<typeof SelectSample>>()

async function handleOk(isSave?: boolean, generateCode?: EGenerateCode) {
  if (!selectSampleRef.value?.checkFormData())
    return
  const metaData = await selectSampleRef.value?.getMetaData(isSave)
  if (!metaData) {
    message.error('请选择样品')
    return
  }
  loading.value = true
  const samples = await props.param.onSaveSample(metaData, isSave, generateCode).finally(() => {
    loading.value = false
  })
  if (!isSave)
    visible.value = false

  return samples
}

/** 保存样品并保存委托：生成样品编号后自动保存委托，需要先保存样品数据 */
provide('saveSampleOrConsign', handleOk)
</script>

<style>

</style>
