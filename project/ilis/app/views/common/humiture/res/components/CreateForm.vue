<template>
  <div>
    <ht-modal
      v-model:open="open"
      title="预约功能室"
      width="460px"
      :mask-closable="false"
      destroy-on-close
      :loading="submitLoading"
      centered
      @cancel="cancel"
    >
      <template #footer>
        <a-button @click="cancel">
          {{ isDetail ? "关闭" : "取消" }}
        </a-button>
        <a-button
          v-if="!isDetail"
          type="primary"
          :loading="submitLoading"
          @click="onSubmit"
        >
          确定
        </a-button>
      </template>
      <FormInner
        ref="formRef"
        :default-lab-id="defaultLabId"
        :data-source="dataSource"
      ></FormInner>
    </ht-modal>
  </div>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import type { CreateHumitureResEntity } from '~/views/common/humiture/res/api/createHumitureRes.ts'
import { message } from 'ant-design-vue'
import { createHumitureRes } from '~/views/common/humiture/res/api/createHumitureRes.ts'
import { editHumitureRes } from '~/views/common/humiture/res/api/editHumitureRes.ts'
import FormInner from './FormInner.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  defaultLabId: {
    type: String,
    default: null,
  },
  dataSource: {
    type: Object as PropType<CreateHumitureResEntity>,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const open = computed(() => props.open)

const isDetail = computed(() => !!(props.dataSource && !props.dataSource.id))

const isEdit = computed(() => !!(props.dataSource && props.dataSource.id))

const formRef = ref()

const submitLoading = ref(false)

watch(open, (val) => {
  if (!val) {
    cancel()
  }
})

async function onSubmit() {
  const { getFormData } = formRef.value
  const formState = await getFormData()
  submitLoading.value = true
  if (isEdit.value) {
    await editHumitureRes(props.dataSource.id as string, formState).finally(() => {
      submitLoading.value = false
    })
  }
  else {
    await createHumitureRes(formState).finally(() => {
      submitLoading.value = false
    })
  }

  message.success('保存成功')
  emits('onSave')
  cancel()
}

// 关闭弹窗
function cancel() {
  const { reset } = formRef.value
  emits('update:open', false)
  reset()
}
</script>
