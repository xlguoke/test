<!-- 变更规程类型 -->
<template>
  <a-modal
    :open="open"
    title="设置规程"
    width="80%"
    :mask-closable="false"
    :keyboard="false"
    centered
    @ok="onOk"
    @cancel="onCancel"
  >
    <div class="h-[75vh]">
      <Main
        v-if="open"
        ref="standardRef"
        :sample-id="props.sampleId"
        :param-ids="props.paramIds"
        :enable-clause-code="enableClauseCode"
      />
    </div>
  </a-modal>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import Main from './Main.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  sampleId: {
    type: String,
    default: null,
  },
  paramIds: {
    type: Array as PropType<string[]>,
    default: () => ([]),
  },
})

const emits = defineEmits(['update:open', 'save'])

const standardRef = ref()

const open = computed(() => props.open)

const enableClauseCode = ref(false)

getBusinessParam('OTHER_9').then((val) => {
  enableClauseCode.value = val
})

// 关闭弹窗
function onCancel() {
  emits('update:open', false)
}

async function onOk() {
  await standardRef.value.onSave(() => {
    message.success('保存成功！')
    emits('save')
    onCancel()
  })
}
</script>
