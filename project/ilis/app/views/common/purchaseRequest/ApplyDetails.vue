<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <a-flex class="h-full">
        <RequestForm ref="requestFormRef" :check-id="id" />
      </a-flex>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import RequestForm from './components/RequestForm.vue'

const requestFormRef = ref()

const urlParams = new URLSearchParams(location.search)

const id = ref(urlParams.get('id'))

onMounted(() => {
  requestFormRef.value.init()
})
</script>
