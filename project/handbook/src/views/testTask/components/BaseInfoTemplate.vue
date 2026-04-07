<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Template } from 'custodian'
import { useEditCheck } from './useEditCheck'

const emits = defineEmits(['valid'])
const { formData, taskParams, editCheck } = useEditCheck()
const router = useRouter()
const route = useRoute()
const templateInfo = ref(inject('templateInfo') as Template)

// 选择模板
async function chooseTemple() {
  const isedit = await editCheck()
  if (!isedit)
    return
  router.push({
    name: 'SelTemplate',
    params: {
      id: formData.value.templateId,
    },
  })
}

// 选择模板
watch(
  () => route.params.SelTemplate,
  (obj: any) => {
    if (!obj)
      return
    if (formData.value.templateId === obj.id)
      return
    formData.value.templateId = obj.id
    formData.value.template = obj.name
    formData.value.testItemId = obj.testItemId
    formData.value.sampleId = ''
    formData.value.sampleName = ''
    taskParams.value = []
    templateInfo.value = obj
    emits('valid', 'template')
  },
)
</script>

<template>
  <van-field
    v-model="formData.template"
    name="template"
    placeholder="请选择模板"
    readonly
    label="模板"
    right-icon="arrow"
    :rules="[{ required: true, message: '请选择模板' }]"
    @click="chooseTemple"
  />
</template>

<style></style>
