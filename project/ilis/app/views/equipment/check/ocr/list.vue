<template>
  <IlisContainer
    app-id="equipment_cert_ocr"
    :tab-list="tabList"
    :active-tab-key="key"
    @tab-change="key => onTabChange(key)"
  >
    <ListTodo v-if="key === 'tab1'" />
    <ListReady v-if="key === 'tab2'" />
  </IlisContainer>
</template>

<script setup lang='ts'>
import ListReady from './component/ListReady.vue'
import ListTodo from './component/ListTodo.vue'

const key = ref('tab1')

const tabList = [
  {
    key: 'tab1',
    tab: '待确认文件',
  },
  {
    key: 'tab2',
    tab: '已确认文件',
  },
]

function onTabChange(value: string) {
  key.value = value
};
</script>
