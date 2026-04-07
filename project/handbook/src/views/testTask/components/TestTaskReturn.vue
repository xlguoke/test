<script setup lang="ts">
import { showSuccessToast } from 'vant'
import { ref } from 'vue'
import { TestTaskReturnType } from '.'
import { request } from '@/axios'

const emits = defineEmits(['success'])

const show = ref(false)

const targetVisible = ref(false)

const actions = ref<{ name: string, value: string }[]>([])

const formData = ref({
  source: '',
  sourceObjId: '',
  target: '',
  targetLabel: '',
  reason: '',
})

async function open(taskId: string, returnType: TestTaskReturnType) {
  formData.value.sourceObjId = taskId
  formData.value.reason = ''

  if ([TestTaskReturnType.复核确认中, TestTaskReturnType.报告审批中].includes(returnType)) {
    formData.value.source = returnType
    formData.value.target = 'testTask'
    formData.value.targetLabel = '试验检测'

    actions.value = [
      { name: '试验检测', value: 'testTask' },
    ]
  }
  else {
    formData.value.source = 'testTask'
    formData.value.target = 'consign'
    formData.value.targetLabel = '委托收样'

    actions.value = [
      { name: '委托收样', value: 'consign' },
      { name: '任务分配', value: 'taskAssign' },
    ]
  }

  show.value = true
}

async function onOk() {
  const loading = showLoadingToast({
    duration: 0,
    forbidClick: true,
  })
  await request({
    url: '/ilis2/businessRollbackController.do?rollback',
    method: 'POST',
    data: {
      ...formData.value,
      targetLabel: undefined,
    },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).finally(loading.close)

  showSuccessToast('操作成功！')
  emits('success')
}

defineExpose({
  open,
})
</script>

<template>
  <van-dialog
    v-model:show="show"
    title="流程退回"
    show-cancel-button
    width="460px"
    @confirm="onOk"
  >
    <div style="padding: 16px;">
      <van-field
        v-model="formData.targetLabel"
        label="退回至"
        is-link
        readonly
        placeholder="请选择"
        label-align="right"
        @click-input="targetVisible = true"
      >
      </van-field>

      <van-field
        v-model="formData.reason"
        label="退回原因"
        type="textarea"
        autosize
        :row="2"
        label-align="right"
        placeholder="请输入"
      />
    </div>
  </van-dialog>

  <van-action-sheet
    v-model:show="targetVisible"
    :actions="actions"
    :round="false"
    cancel-text="取消"
    @select="(item) => {
      formData.target = item.value
      formData.targetLabel = item.name
      targetVisible = false
    }"
  />
</template>

<style lang="less" scoped>

</style>
