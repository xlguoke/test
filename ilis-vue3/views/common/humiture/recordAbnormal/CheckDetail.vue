<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :bordered="false"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <Details :check-id="checkId" />
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import Details from './components/Details.vue'

const pathParams = new URLSearchParams(location.search)

const checkId = ref(pathParams.get('businessKey'))
</script>
