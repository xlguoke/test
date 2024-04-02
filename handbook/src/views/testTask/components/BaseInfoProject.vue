<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FormItem, Input } from 'ant-design-vue'
import { RightOutlined } from '@ant-design/icons-vue'
import type { TaskBaseInfoDTO } from '@/type/testTask'

const emits = defineEmits(['valid'])
const router = useRouter()
const route = useRoute()
const formData = ref(inject('formData') as TaskBaseInfoDTO)

// 选择工程项目
function chooseProject() {
  router.push({
    name: 'SelProject',
    params: {
      id: formData.value.projectId,
    },
  })
}

// 选择工程项目
watch(
  () => route.params.SelProject,
  (obj: any) => {
    if (!obj)
      return
    formData.value.projectId = obj.id
    formData.value.projectName = obj.name
    formData.value.unitProjectId = ''
    formData.value.unitProjectName = ''
    emits('valid', 'projectName')
  },
)
</script>

<template>
  <FormItem
    label="工程项目"
    name="projectName"
    :rules="[{ required: true, message: '请选择工程项目' }]"
  >
    <Input
      v-model:value="formData.projectName"
      readonly
      placeholder="请选择工程项目"
      @click="chooseProject"
    >
      <template #suffix>
        <RightOutlined />
      </template>
    </Input>
  </FormItem>
</template>

<style></style>
