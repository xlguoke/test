<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FormItem, Input, message } from 'ant-design-vue'
import { RightOutlined } from '@ant-design/icons-vue'
import { useEditCheck } from './useEditCheck'

const emits = defineEmits(['valid'])
const { formData, taskParams, editCheck } = useEditCheck()
const router = useRouter()
const route = useRoute()

// 选择样品
async function chooseSample() {
  const { sampleId, testItemId } = formData.value
  if (!testItemId)
    return message.warning('请先选择模板')

  const isedit = await editCheck()
  if (!isedit)
    return

  router.push({
    name: 'SelSample',
    query: {
      id: sampleId,
      testItemId,
    },
  })
}

// 选择样品
watch(
  () => route.params.SelSample,
  (obj: any) => {
    if (!obj)
      return
    if (formData.value.sampleId === obj.id)
      return
    formData.value.sampleId = obj.id
    formData.value.sampleName = obj.name
    taskParams.value = []
    emits('valid', 'sampleName')
  },
)
</script>

<template>
  <FormItem
    label="样品"
    name="sampleName"
    :rules="[{ required: true, message: '请选择样品' }]"
  >
    <Input
      v-model:value="formData.sampleName"
      readonly
      placeholder="请选择样品"
      @click="chooseSample"
    >
      <template #suffix>
        <RightOutlined />
      </template>
    </Input>
  </FormItem>
</template>

<style></style>
