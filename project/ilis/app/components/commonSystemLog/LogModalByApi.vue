<template>
  <HtModal
    v-model:open="internalOpen"
    title="日志"
    :after-close="onClosed"
    width="60vw"
    hide-confirm
  >
    <div class="min-h-[50vh]">
      <LogList :id="param.id" :log-type="param.logType" :relation-qry="param.relationQry" :list="list" />
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { ILog } from '~/components/commonSystemLog/index.ts'

const props = defineProps<IDialogPropsParam<null, { id: string, logType: string, relationQry: boolean, list: ILog[] }>>()

const list = computed(() => props.param.list || null)

const internalOpen = ref(false)

onMounted(() => {
  internalOpen.value = true
})
</script>
