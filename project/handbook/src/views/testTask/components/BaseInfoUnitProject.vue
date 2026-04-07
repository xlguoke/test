<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TaskBaseInfoDTO } from '@/type/testTask'

const router = useRouter()
const route = useRoute()
const formData = ref(inject('formData') as TaskBaseInfoDTO)

// 选择单位工程
function chooseUnitProject() {
  const { unitProjectId, projectId, projectName } = formData.value
  if (!formData.value.projectId)
    return showToast({ type: 'fail', message: '请先选择工程项目' })

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
  <van-field
    v-model="formData.unitProjectName"
    name="unitProjectName"
    placeholder="请选择工程划分"
    readonly
    label="工程划分"
    right-icon="arrow"
    clearable
    @clear="clearInput"
    @click="chooseUnitProject"
  >
    <template #right-icon>
      <div style="display: flex;align-items: center;">
        <van-icon
          v-show="!!formData.unitProjectName"
          name="close"
          style="color: #999"
          @click.stop="clearInput"
        />
        <van-icon name="arrow" />
      </div>
    </template>
  </van-field>
</template>

<style></style>
