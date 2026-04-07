<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  <van-field
    v-model="formData.projectName"
    name="projectName"
    placeholder="请选择工程项目"
    readonly
    label="工程项目"
    right-icon="arrow"
    :rules="[{ required: true, message: '请选择工程项目' }]"
    @click="chooseProject"
  />
</template>

<style></style>
