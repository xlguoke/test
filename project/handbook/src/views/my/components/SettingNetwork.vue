<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import autoUpdate from '@/stores/autoUpdate'

const { autoUpdateNetwrok } = storeToRefs(autoUpdate())

const visible = ref<boolean>(false)

const columns = ref([
  { text: 'wifi和移动网络下', value: 'all' },
  { text: '仅在wifi下', value: 'wifi' },
  { text: '仅在移动网络下', value: 'cellular' },
])

const updateType = ref(['all'])
function openSet() {
  updateType.value = [autoUpdateNetwrok.value]
  visible.value = true
}

function handleOk() {
  autoUpdate().setNetWork(updateType.value[0])
  visible.value = false
}
</script>

<template>
  <div>
    <span class="label">自动更新数据方式</span>
    <div class="value" @click="openSet">
      {{ columns.find(item => item.value === autoUpdateNetwrok)?.text }}
      <van-icon name="arrow" />
    </div>

    <van-popup v-model:show="visible" round position="bottom">
      <van-picker
        v-model="updateType"
        :columns="columns"
        @confirm="handleOk"
        @cancel="visible = false"
      />
    </van-popup>
  </div>
</template>

<style></style>
