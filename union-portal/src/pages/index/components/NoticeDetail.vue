<script setup lang='ts'>
import { useDateFormat } from '@vueuse/core'
import useMyFetch from '@/composables/useMyFetch'
import type { Notice } from '@/types/index.d'

const visible = ref(false)
const detailId = ref('')
const apiUrl = computed(() => `/api/v1/todos/${detailId.value}`)
const { isFetching, data, execute } = useMyFetch<Notice>(apiUrl, {}, { immediate: false })

function showModal(id: string) {
  visible.value = true
  detailId.value = id
  nextTick(() => execute())
}

defineExpose({
  showModal,
})
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="详情"
    destroy-on-close
    width="80%"
  >
    <a-spin :spinning="isFetching">
      <div class="h-[64vh] overflow-auto">
        <h2 text-center>
          {{ data?.title }}
        </h2>
        <p flex justify-between text-gray-4>
          <span>{{ data?.application }}</span>
          <span>发起人：{{ data?.username }}</span>
          <span>发起时间：
            {{
              data?.auditMeta && data?.auditMeta?.createdAt
                ? useDateFormat(data.auditMeta.createdAt, 'YYYY-MM-DD HH:mm:ss')
                : '--'
            }}
          </span>
        </p>
        <!-- eslint-disable-next-line vue/html-self-closing -->
        <div mt-4 v-html="data?.details"></div>
      </div>
    </a-spin>
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
  </a-modal>
</template>

<style>

</style>
