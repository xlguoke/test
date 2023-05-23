<template>
  <a-modal
    v-model:visible="dialogVisible"
    title="通知公告"
    width="600px"
    :mask-closable="false"
    :keyboard="false"
    :centered="true"
  >
    <div style="max-height: 400px">{{ noticeData.content }}</div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
const props = defineProps({
  demoData: {
    type: String,
    default: ""
  }
})

console.log(props.demoData)

const noticeData = ref({
  content: ""
})

const dialogVisible = ref<boolean>(false)
const openDialog = (d: any) => {
  dialogVisible.value = true
  noticeData.value = d
}

defineExpose({
  openDialog
})
</script>

<style scoped lang="scss"></style>
