<template>
  <IlisContainer app-id="equipment_goout_aduit">
    <List v-if="routePage === 'list'" />
    <Detail v-if="routePage === 'detail'" :id="dataId" />
  </IlisContainer>
</template>

<script setup lang='ts'>
import Detail from './components/Detail.vue'
import List from './components/List.vue'

const routePage = ref('list')
const dataId = ref('')

const urlParam = new URLSearchParams(window.location.search)
routePage.value = urlParam.get('routePage') || 'list'
dataId.value = urlParam.get('businessKey') || ''
</script>

<style>

</style>
