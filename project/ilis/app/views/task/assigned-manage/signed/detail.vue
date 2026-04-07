<template>
  <ht-modal
    v-model:open="modalVisible"
    title="试验任务详情"
    width="90%"
    fixed-height
    full-screen
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
import type { TaskAssignedManageEntity } from './TaskAssignedManageEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { useIndustryStore } from '~/store/industryStore'

const props = defineProps<IDialogPropsParam<null, TaskAssignedManageEntity>>()

const modalVisible = ref(true)

const src = computed(() => {
  const { industryId } = useIndustryStore()
  const src = `${import.meta.env.VITE_ILIS_BASE}/testTaskController.do?goTestTaskDetail&readType=5&page=task&id=${props.param.testTaskId}&industryId=${industryId}`
  return src
})
</script>
