<template>
  <a-modal
    v-model:open="open"
    title="详情"
    width="720px"
    :mask-closable="false"
    destroy-on-close
    :confirm-loading="submitLoading"
    centered
    @cancel="cancel"
  >
    <Details :check-id="dataSource.id" />

    <template #footer>
      <a-button @click="cancel">
        关闭
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import Details from './Details.vue'
import type { HumitureRecordDataItem } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object as PropType<HumitureRecordDataItem>,
    default: () => {},
  },
})

const emits = defineEmits(['update:open'])

const open = computed(() => props.open)

const submitLoading = ref(false)

watch(open, (val) => {
  if (!val) {
    cancel()
  }
})

// 关闭弹窗
function cancel() {
  emits('update:open', false)
}
</script>
