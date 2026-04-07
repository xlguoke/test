<template>
  <ht-modal
    v-model:open="internalOpen"
    width="460px"
    title="打印"
    @cancel="handleCancel"
  >
    <div style="min-height: 150px;">
      <p>是否含已移除授权人员：</p>
      <a-radio-group v-model:value="isIncludeOutUser">
        <a-radio value="1">
          是
        </a-radio>
        <a-radio value="0">
          否
        </a-radio>
      </a-radio-group>
    </div>
    <template #footer>
      <a-button @click="handleCancel()">
        取消
      </a-button>
      <a-button type="primary" @click="handleConfirm()">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<{ isIncludeOutUser: string }, any>>()

const internalOpen = ref(false)

const isIncludeOutUser = ref('1')

onMounted(() => {
  internalOpen.value = true
})

/**
 * # 确认
 */
function handleConfirm() {
  props.onConfirm({
    isIncludeOutUser: unref(isIncludeOutUser.value),
  })
  handleCancel()
}

/**
 * # 取消
 */
function handleCancel() {
  internalOpen.value = false
}
</script>
