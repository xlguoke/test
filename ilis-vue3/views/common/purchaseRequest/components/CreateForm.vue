<template>
  <ht-modal
    v-model:open="open"
    :title="title"
    width="80%"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    @cancel="cancel"
  >
    <RequestForm ref="requestFormRef" :edit-id="editId" :check-id="checkId" />

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
  </ht-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import RequestForm from './RequestForm.vue'
import { createPurchase, updatePurchase } from '~/views/common/purchaseRequest/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  editId: {
    type: String,
    default: null,
  },
  checkId: {
    type: String,
    default: null,
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const isDetail = computed(() => !!props.checkId)

const isEdit = computed(() => !!props.editId)

const open = computed(() => props.open)

const requestFormRef = ref()

const submitLoading = ref(false)

const title = computed(() => {
  if (isDetail.value) {
    return '查看详情'
  }

  if (isEdit.value) {
    return '编辑申请'
  }

  return '新增申请'
})

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    nextTick(() => {
      requestFormRef.value.init()
    })
  }
})

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  requestFormRef.value.onReset()
}

function onSubmit() {
  requestFormRef.value.onSubmit(async (data) => {
    submitLoading.value = true

    if (isEdit.value) {
      await updatePurchase(data).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await createPurchase(data).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('保存成功')
    emits('onSave')
    cancel()
  })
}
</script>
