<template>
  <ht-modal
    v-model:open="modalVisible"
    title="委托详情"
    width="90%"
    fixed-height
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="modalVisible = false">
        关闭
      </a-button>
    </template>
    <iframe :src="src" frameborder="0" width="100%" height="100%"></iframe>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { TaskUnAssignedManageEntity } from './TaskUnAssignedManageEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { useIndustryStore } from '~/store/industryStore'

const props = defineProps<IDialogPropsParam<null, TaskUnAssignedManageEntity>>()

const modalVisible = ref(true)

const { industryId } = storeToRefs(useIndustryStore())

const src = computed(() => {
  const src = `${import.meta.env.VITE_ILIS_BASE}/unAssignedTaskController.do?goConsignDetailPage&id=${props.param.consignId}&detail=detailPage&sampleId=${props.param.sampleId}&isTaskRedirect=true&industryId=${industryId.value}`
  return src
})
</script>
