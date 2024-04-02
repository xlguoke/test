<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FormItem, Input, message } from 'ant-design-vue'
import { CloseCircleFilled, RightOutlined } from '@ant-design/icons-vue'
import type { TaskBaseInfoDTO } from '@/type/testTask'

const router = useRouter()
const route = useRoute()
const formData = ref(inject('formData') as TaskBaseInfoDTO)

// 选择单位工程
function chooseUnitProject() {
  const { unitProjectId, projectId, projectName } = formData.value
  if (!formData.value.projectId)
    return message.warning('请先选择工程项目')

  router.push({
    name: 'SelUnitProject',
    query: {
      id: unitProjectId,
      projectId,
      projectName,
    },
  })
}

// 选择单位工程
watch(
  () => route.params.SelUnitProject,
  (obj: any) => {
    if (!obj)
      return
    formData.value.unitProjectId = obj.id
    formData.value.unitProjectName = obj.name
  },
)

function clearInput() {
  formData.value.unitProjectId = ''
  formData.value.unitProjectName = ''
}
</script>

<template>
  <FormItem label="工程划分" name="unitProjectName">
    <Input
      v-model:value="formData.unitProjectName"
      readonly
      placeholder="请选择工程划分"
      @click="chooseUnitProject"
    >
      <template #suffix>
        <CloseCircleFilled
          v-show="!!formData.unitProjectName"
          style="color: #999"
          @click="clearInput"
        />
        <RightOutlined />
      </template>
    </Input>
  </FormItem>
</template>

<style></style>
