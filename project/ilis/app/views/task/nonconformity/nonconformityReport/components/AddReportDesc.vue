<template>
  <div>
    <HtModal
      v-model:open="visible"
      title="新增不合格上报"
      width="640px"
      :after-close="onClosed"
    >
      <div class="py-4">
        <TitleBar>不合格情况</TitleBar>
        <div class="mt-4">
          <a-textarea v-model:value="description" placeholder="请输入其他检查及检查结果" :rows="4" :maxlength="500" />
        </div>
      </div>

      <template #footer>
        <a-button @click="visible = false">
          取消
        </a-button>
        <a-button type="primary" @click="handleOk">
          确定
        </a-button>
      </template>
    </HtModal>
  </div>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import TitleBar from '~/components/TitleBar.vue'

const props = defineProps<IDialogPropsParam<null, any>>()

const visible = ref(true)

const description = ref(props.param.desc)

async function handleOk() {
  if (!description.value) {
    message.warning('请填写不合格情况！')
    return
  }

  props.onConfirm(unref(description.value))
  visible.value = false
}
</script>
