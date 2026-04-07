<template>
  <IlisContainer
    app-id="business_application"
    :tab-list="tabList"
    :active-key="activeKey"
    :on-tab-change="onTabChange"
  >
    <ListPending v-if="activeKey === '1'" />
    <ListDone v-if="activeKey === '2'" />
  </IlisContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ListDone from './components/ListDone.vue'
import ListPending from './components/ListPending.vue'

const activeKey = ref('1')
const tabList = [
  {
    key: '1',
    tab: '待审核',
  },
  {
    key: '2',
    tab: '已审核',
  },
]

function onTabChange(e: string) {
  activeKey.value = e
}
</script>

  <style>
    #video_application .ant-tabs-content{
      height: 100%;
    }
  </style>
