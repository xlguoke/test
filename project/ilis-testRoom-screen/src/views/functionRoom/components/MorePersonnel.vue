<template>
  <ConfirmModal
    v-model:value="visible"
    close-ok
    title="责任人简介"
    cancel-text="关闭"
    @cancel="cancel"
  >
    <div v-for="(d, i) in datas" :key="i">
      <p class="data-item">{{ d }}</p>
    </div>
  </ConfirmModal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import ConfirmModal from "@/components/ConfirmModal.vue"
defineProps({
  datas: {
    type: Array,
    default: () => []
  }
})

const visible = ref(false)

function cancel() {
  visible.value = false
}

function openModal() {
  visible.value = true
}

defineExpose({
  openModal
})
</script>

<style>
.data-item {
  line-height: 0.44rem;
  min-height: 0.32rem;
}
</style>
